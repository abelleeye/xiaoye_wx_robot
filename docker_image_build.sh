#!/bin/bash

script_path=$(readlink -f "$0")
script_directory=$(dirname "$script_path")
echo "repository directory: ${script_directory}"

cd $script_directory


VERSION=`cat ./package.json | grep version | awk '{print substr($2, 2, length($2)-3)}'`

echo "VERION: ${VERSION}"

image_name="abelleeye/xiaoye_wx_robot:${VERSION}"

if [[ "$(docker images -q ${image_name} 2> /dev/null)" != "" ]]; then
    echo "Docker images contain $image_name"
    while true; do
        echo "Are you sure to build this image? (y/n)"
        read is_build_ensure
        if [ "$is_build_ensure" == "y" ]; then
            break
        elif [ "$is_build_ensure" == "n" ]; then
            exit 1
        else
            echo "Invalid input. Please enter 'y' or 'n'."
        fi
    done
fi


echo "Start to build docker image."

build_docker_dir_name=docker_build
rm -rf ./$build_docker_dir_name
mkdir ./$build_docker_dir_name

current_branch=$(git rev-parse --abbrev-ref HEAD)
git archive $current_branch --format=tar --output=./$build_docker_dir_name/xiaoye_wx_robot.tar

docker build --no-cache -t abelleeye/xiaoye_wx_robot:${VERSION} .

while true; do
    echo "Do you want to push image? (y/n)"
    read is_push
    if [ "$is_push" == "y" ]; then
        docker push abelleeye/xiaoye_wx_robot:${VERSION}
        break
    elif [ "$is_push" == "n" ]; then
        break
    else
        echo "Invalid input. Please enter 'y' or 'n'."
    fi
done

rm -rf ./$build_docker_dir_name

echo "Docker image build success."