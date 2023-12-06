import QrcodeTerminal from 'qrcode-terminal'
import { 
    WechatyBuilder,
    ScanStatus,
} from 'wechaty'
import api from './api.js';

process.on('uncaughtException', err => console.error('Caught exception: ' + err));

const Robot = {
    field: {
        name: null,
        token: null,
        signature: null,
        bot: null,
    },
    async run() {
        console.debug("Robot run.");
        await this.init();
    },
    async init() {
        console.debug("Robot init.");

        console.debug("Init robot name.");
        const robotName = process.env.XIAOYE_WX_ROBOT_NAME;
        if (!robotName || robotName.trim() === '') {
            console.debug("Please export XIAOYE_WX_ROBOT_NAME=");
            process.exit(-1);
        }
        this.field.name = robotName;
        console.debug("robot name: ", robotName);

        console.debug("Init token.");
        const token = process.env.XIAOYE_WX_ROBOT_TOKEN;
        if (!token || token.trim() === '') {
            console.debug("Please export XIAOYE_WX_ROBOT_TOKEN=");
            process.exit(-1);
        }
        this.field.token = token;
        console.debug("token: ", token);

        await this.fetchSignature();
        await this.wechatyStart();
    },
    async fetchSignature() {
        return new Promise(async resolve => {
            console.debug("Try to fetch signature, url: " + "https://chatbot.weixin.qq.com/openapi/sign/" + this.field.token);
            const response = await api.post("https://chatbot.weixin.qq.com/openapi/sign/" + this.field.token, {userid: 1});
            console.debug("Fetch signature response: " + JSON.stringify(response));
            if (response.errcode === 1001) {
                console.error(response.errmsg);
                process.exit(-1);
            }
            this.field.signature = response.signature;
            resolve();
        });
    },
    async wechatyStart() {
        this.field.bot = WechatyBuilder.build();
        this.field.bot
            .on('scan', (qrcode, status) => {
                if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
                    QrcodeTerminal.generate(qrcode, {small: true});
                    return;
                }
                console.info('onScan: %s(%s)', ScanStatus[status], status)
            })
            .on('login',            user => console.info(`${user.name()} login`))
            .on('logout',           user => console.info(`${user.name()} logged out`))
            .on('error',            e    => console.error('Bot error:', e))
            .on('message',       message => {
                console.debug(`Wechaty message: ${message.toString()}`);
                this.messageProcesse(message);
            })
            .start()
            .catch(async e => {
                console.error('Bot start() fail:', e);
                await this.field.bot.stop();
                process.exit(-1);
          })
    },
    MessageEvent: {
        WX_AIBOT: ["天气", "抽签", "解第"],
    },
    async messageProcesse(msg) {
        let robotName = this.field.name;
        let atRobotName = "@" + robotName;

        let text = msg.text();
        let room = msg.room();
        // let talker = msg.talker();
        // let type = msg.type();

        if (msg.self()) {
            console.info('Message discarded because its outgoing');
            return;
        }
    
        if (msg.age() > 2 * 60) {
            console.info('Message discarded because its TOO OLD(than 2 minutes)');
            return;
        }

        if (msg.type() !== this.field.bot.Message.Type.Text) {
            console.info('Message type is not Text. Message type: ', msg.type());
            return;
         }

        if (text.length == 0 || !room) return;

        if (!text.startsWith(atRobotName)) return;

        // let topic = await room.topic(); // room name stay here.

        let _text = text.replace(atRobotName, "").trim();

        this.wxAibot(room, _text);
    },

    async wxAibot(room, text) {
        console.debug("wxAibot module.")

        let robotName = this.field.name;

        let response = await api.post("https://chatbot.weixin.qq.com/openapi/aibot/" + this.field.token, {
            signature: this.field.signature,
            query: text,
        });

        if (response.errcode == 1005) {
            await this.fetchSignature();
            response = await api.post("https://chatbot.weixin.qq.com/openapi/aibot/" + this.field.token, {
                signature: this.field.signature,
                query: text,
            });
        }

        console.debug("aibot response: ", response);

        let answer = response.answer;

        if (response.status == "FAQ_RECOMMEND") {
            answer = "请问你是不是想问：" + response.options[0].title;
        }

        if (text.startsWith("解第")) {
            answer = JSON.parse(answer).multimsg[0];
        }

        if (!answer || answer.trim() === '') {
            answer = "没有匹配到对应的回答哦~";
        }

        console.log("Answer: ", answer);

        await room.say(answer);
    }
}

Robot.run();