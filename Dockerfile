FROM abelleeye/xiaoye_wx_robot:env

MAINTAINER Abel Lee

RUN rm -rf xiaoye_wx_robot
COPY docker_build/xiaoye_wx_robot.tar /xiaoye_wx_robot/xiaoye_wx_robot.tar
RUN cd /xiaoye_wx_robot && tar xvf ./xiaoye_wx_robot.tar && rm -rf ./xiaoye_wx_robot.tar
RUN cd /xiaoye_wx_robot && yarn