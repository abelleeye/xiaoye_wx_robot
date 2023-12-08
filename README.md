# xiaoye wx robot

# 介绍

自己使用的微信机器人


# 如何运行

- 选择运行版本:
  
  `export XIAOYE_WX_ROBOT_VERSION=0.0.1`
  
- 机器人名字:  
  
  `export XIAOYE_WX_ROBOT_NAME=小也`
  
- token:  
  
  `export XIAOYE_WX_ROBOT_TOKEN=${token}`
   
  token获取 https://chatbot.weixin.qq.com  -> 发布管理 -> 应用绑定 -> 开放API
  
- 拉取docker-compose.yaml

	`wget https://raw.githubusercontent.com/abelleeye/xiaoye_wx_robot/main/docker-compose.yaml`
    
  `docker-compose up`
