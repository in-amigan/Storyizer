Building and Deploying Containers Using Amazon Elastic Container Service

SPL-208 - Version 1.1.13

© 2023 Amazon Web Services, Inc. or its affiliates. All rights reserved. This work may not be reproduced or redistributed, in whole or in part, without prior written permission from Amazon Web Services, Inc. Commercial copying, lending, or selling is prohibited. All trademarks are the property of their owners.

Note: Do not include any personal, identifying, or confidential information into the lab environment. Information entered may be visible to others.

Corrections, feedback, or other questions? Contact us at AWS Training and Certification.
Lab Overview

This lab demonstrates the use of Amazon Elastic Container Service to host a simple multi-component web application composed of a website with two supporting API services. The website displays a form where you compose a story with placeholders for nouns, verbs and adjectives. When you click the submit button, the words API is queried for the words needed in order to fill in all the placeholders in the story text. You can then click save which will utilize the save API to persist your creation to Amazon DynamoDB. The app is called: Storyizer

You will first build the Docker container for each component of the web app on a command host. Then you will push them to the Amazon Elastic Container Repository (ECR) so they can be retrieved when the ECS cluster is built.

At that point you will launch a CloudFormation template which will build the ECS Cluster with an ECS Service defined for each of the three components of your web application. Each service is configured to maintain two running tasks (task is the definition to run a given Docker container). This results in a highly available design since, if a service task becomes unhealthy, ECS will replace it with a newly launched task automatically. ECS will also coordinate dynamic host port mapping with the Application Load Balancer (ALB) and each ECS task. This allows you to run more than one container of an app component on a single host without port conflicts.

High-level architecture
Topics Covered

After completing this lab, you will be able to:

    Understand the steps needed to build docker images.
    Push container images to an Amazon ECR repository.
    Deploy containers from a repository to an Amazon ECS cluster as Services.

Technical Knowledge Prerequisites

This lab requires:

    Access to a notebook computer with Wi-Fi running Microsoft Windows, Mac OS X, or Linux (Ubuntu, SuSE, or Red Hat)
    The qwikLABS lab environment is not accessible using an iPad or tablet device.
    For Microsoft Windows users: Administrator access to the computer
    An Internet browser such as Chrome, Firefox, or IE9 or greater (previous versions of Internet Explorer are not supported)

Start lab

    To launch the lab, at the top of the page, choose Start lab.

You must wait for the provisioned AWS services to be ready before you can continue.

    To open the lab, choose Open Console.

You are automatically signed in to the AWS Management Console in a new web browser tab.

Do not change the Region unless instructed.
Common sign-in errors
Error: You must first sign out

If you see the message, You must first log out before logging into a different AWS account:

    Choose the click here link.
    Close your Amazon Web Services Sign In web browser tab and return to your initial lab page.
    Choose Open Console again.

Error: Choosing Start Lab has no effect

In some cases, certain pop-up or script blocker web browser extensions might prevent the Start Lab button from working as intended. If you experience an issue starting the lab:

    Add the lab domain name to your pop-up or script blocker’s allow list or turn it off.
    Refresh the page and try again.

Task 1: Login to the Command Host
Connect to EC2 using SSM

In this task, you connect to your Amazon EC2 Instance using AWS Systems Manager Session Manager.

    Copy the InstanceSessionUrl value from the list to the left of these instructions, and then paste it into a new web browser tab.

A console connection is made to the instance inside your web browser window. A set of commands are run automatically when you connect to the instance that change to the user’s home directory and display the path of the working directory, similar to this:

cd HOME; pwd; bash
sh-4.2$ cd HOME; bash; pwd
/home/ec2-user
[ec2-user@ip-10-0-1-137 ~]$

Congratulations! You have successfully connected to a terminal session on the lab EC2 instance.
Task 2: Exploring the Dockerfile

Files for the Storyizer application have been pre-loaded on the Command Host for your use during the lab.

    Run this command in your session:

cd SPL-208-Resources/
cd Code/
ls -ls

Example Output:

drwxr-xr-x 2 ec2-user ec2-user 4096 Jul 25 00:47 API
drwxr-xr-x 3 ec2-user ec2-user 4096 Jul 25 00:47 Save
drwxr-xr-x 3 ec2-user ec2-user 4096 Jul 25 00:47 WebSite

As you can see from the files, the Storyizer’s application is broken into different layers:

    The Website is a simple web app running on apache.
    The API service is an Express Nodejs api layer for looking up the nouns, verbs, and adjectives.
    The Save service is also an Express Nodejs api layer handling save requests and persisting to DynamoDb.

Inside each of these directories, there is a Dockerfile and the latest version of the application code.

You will begin by configuring the main website.

    Run these commands:

cd WebSite

cat Dockerfile

The Dockerfile contains instructions needed to build the Storyizer application environment. You can see it is pulling a base image of Centos, followed by declaring some environment variables to be used in this containerized application.

In this container, you want the ability to define a variable at both build and runtime, so both
ARG
and
ENV
dockerfile commands are utilized.
ARG
can be passed via the
--build-arg
argument.
ENV
variables are global variables available at runtime just like

/bin/bash $HOME
would be in a linux shell.

FROM centos:7
...
ENV ServerName=Storyizer-site
ARG ELBDNS
ENV ELBDNS=${ELBDNS}

The COPY command (shown below) in the Dockerfile is used to copy a directory into the container. In this case, the source code is copied into the container:

COPY ./code/ /var/www/html/

Here are instructions to inject build time configuration values into the Docker Container via additions and substitutions into some of the web app’s configuration files:

# Config App
RUN echo "ServerName storyizer.training " >> /etc/httpd/conf/httpd.conf
RUN sed -i -- "s|APIELB|$ELBDNS|g" /var/www/html/js/env.js
RUN sed -i -- "s|SaveELB|$ELBDNS|g" /var/www/html/js/env.js

Lastly, the port this container is going to listen to for inbound requests is noted with EXPOSE. ENTRYPOINT specifies a command that will always be executed when the container starts:

EXPOSE 80
ENTRYPOINT ["/usr/sbin/httpd", "-D", "FOREGROUND"]

Task 3: Building and Testing the WebSite Container

In this task, you will create the WebSite Container.

First, you will build a docker container for the website.

    Run this command, replacing [elbDNS] with the elbDNS value shown to the left of the instructions you are currently reading. Also remove the [square brackets].

docker build -t storyizer/website --build-arg ELBDNS=[elbDNS] .

The

.
(period) at the end of the docker build command is required.

The complete command should look similar to:

docker build -t storyizer/website --build-arg ELBDNS=StoryizerAELB-842221155.us-east-1.elb.amazonaws.com .

Example Output:

Sending build context to Docker daemon 142.3 kB
Step 1/13 : FROM centos:7
...
Step 4/13 : ENV ServerName Storyizer-site
 ---> Running in adff8384c129
 ---> b6dccb1f71aa
Removing intermediate container adff8384c129
Step 5/13 : ARG ELBDNS
 ---> Running in 179b7c02c22c
 ---> a5998c11c34f
Removing intermediate container 179b7c02c22c
Step 6/13 : ENV ELBDNS ${ELBDNS}
 ---> Running in 7e2993840815
 ---> e7f82551f842
 ...

Keep scrolling the screen to see what part of the dockerfile the build command is currently processing. Upon successful build, you should see a message like below:

Step 13/13 : ENTRYPOINT /usr/sbin/httpd -D FOREGROUND
 ---> Running in 9f31356f466e
 ---> ffddd7b40798
Removing intermediate container 9f31356f466e
Successfully built ffddd7b40798

Now that the docker image has been built, you can test it on the Command Host. The
Run
command is used to start the container. The

-p 80:80
argument in the below command binds port 80 on the command host to port 80 on the docker container. The & in the command below is used to run the container as a background process.

    Run this command:

docker run -p 80:80 storyizer/website &

Now you can check that the docker containers are currently running on this host with the

docker ps
command.

    Run this command:

docker ps

The output includes a CONTAINER ID that you will use to control the container. It will be a random string similar to: ad9af999ab21

    Copy the CommandHost value shown to the left of these instructions.

    Open a new web browser tab and paste CommandHost value into the address bar and hit Enter.

You should be greeted with the Storyizer page. The submit and save buttons do not currently work as they are not currently built or deployed.

You will now stop this docker container.

    Run this command, replacing [CONTAINER-ID] with the Container ID shown in the output of your previous command (under the CONTAINER ID heading):

docker stop [CONTAINER-ID]

Your command should look similar to:

docker stop ad9af999ab21
Task 4: Building the API Container

In this task, you will build the API Container.

First, you will examine the Dockerfile for the API layer of the Storyizer application.

    Run these commands:

cd ../API
cat Dockerfile

Most of the dockerfile for the API container looks similar to the Website Dockerfile. In addition, example use of
WORKDIR
and

CMD
are shown:

COPY ./code/ /opt/
WORKDIR /opt/API

EXPOSE 81

CMD ["node", "/opt/API/app.js"]

You will now build the API container.

    Run this command:

docker build -t storyizer/api .

The

.
(period) at the end of the docker build command is required.

Upon successful build, you should see something similar to:

...
Step 12/13 : EXPOSE 81
 ---> Running in 24f384dd8922
 ---> 42edd6b5c032
Removing intermediate container 24f384dd8922
Step 13/13 : CMD node /opt/API/app.js
 ---> Running in ea04b2547e97
 ---> 316e003043de
Removing intermediate container ea04b2547e97
Successfully built 316e003043de

Task 5: Building the Save Container

In this task, you will build the Save container.

First, you will change to the Save layer folder of the Storyizer application.

    Run this command:

cd ../Save

The Save container is just like the API container, however you need to pass an argument during the build to define the region.

    Run this command replacing [LAB-REGION] with the value for Region_ shown to the left of these instructions:

docker build -t storyizer/save --build-arg AWSREGION=[LAB-REGION] .

Be sure to include the dot (

.
) at the end!

You have now successfully built the Save container.
Task 6: Tagging and Pushing Docker Images to Amazon ECR Repository

Say you want to share these docker images with other AWS accounts and users. In such a scenario, a repository for docker images is useful. In this task, you will be using Amazon ECR to host these images, one repository per application. In a subsequent step of this task, you will be launching an AWS CloudFormation template and will need to provide the URI of the repositories such that ECS can pull the latest version of the docker image when building the cluster.

Until this point, you have created three docker images. But where have they been saved? What were they named?

docker images can be used to show the layers of the docker images that are present on the local system and the repo they are from.

    Run this command below to get information about all the docker images created.

docker images

Example Output:

$ docker images
REPOSITORY               TAG       IMAGE ID         CREATED          SIZE
storyizer/save           latest    aad046838b9e     4 minutes ago    428 MB
storyizer/api            latest    316e003043de     53 minutes ago   404 MB
storyizer/website        latest    ffddd7b40798     5 hours ago      271 MB
centos                   7         36540f359ca3     2 weeks ago      193 MB
centos                   latest    36540f359ca3     2 weeks ago      193 MB
rockylinux/rockylinux    latest    c830f8e8f82b     3 weeks ago      205MB

    IMAGE ID is a unique identifier that can be used to call out a version of a docker image. Alternatively, you can reference the image by the repository it is associated with.

You will now create a repository for each docker image.

    Run these commands:

aws ecr create-repository --repository-name storyizer/website
aws ecr create-repository --repository-name storyizer/api
aws ecr create-repository --repository-name storyizer/save

You can now get the repository URIs.

    Run this command:

aws ecr describe-repositories --query 'repositories[].[repositoryName, repositoryUri]' --output table

    Copy the output to a text editor for use in future commands.

Before you can push the docker images to the repository, you have to log in to Amazon ECR. The command
aws ecr get-login
(aws docs) returns a docker login token that is valid for 12 hours. The output of

aws ecr get-login
can be piped to a shell to run the docker login command to complete the authentication.

    Run this command:

aws ecr get-login --no-include-email | /bin/bash

You can now tag the docker images with the repository URI they are stored in and indicate that they are the latest build with the latest keyword.

    Copy these commands to a text editor:

docker tag storyizer/website:latest [Website-Repository-URI]
docker tag storyizer/save:latest [Save-Repository-URI]
docker tag storyizer/api:latest [API-Repository-URI]

    Substitute the values in [square brackets] with the Repository URIs you copied earlier.

Each command will look similar to:

docker tag storyizer/website:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/storyizer/website:latest

    Run the updated commands in your session.

You can now validate that the tags have been applied.

    Run this command:

docker images

You should see that the images are associated with a repository URI.

    Copy these commands to a text editor:

docker push [Website-Repository-URI]
docker push [Save-Repository-URI]
docker push [API-Repository-URI]

    Substitute the values in [square brackets] with the Repository URIs you copied earlier.

Each command will look similar to:

docker push 344121171123.dkr.ecr.us-east-1.amazonaws.com/storyizer/website:latest

    Run the updated commands in your session.

You should see that the images are copying the different layers which are part of the layered file system that docker has implemented.
Task 7: Deploying to Amazon ECS

Now that the images are stored in the repository, you will create a task for each of the components. To manage the scaling of the docker images, you will also create a service for each app component.

    Run this command:

cat ~/SPL-208-Resources/ECS-Storyizer-Deploy.yaml

Take a few minutes to look at this CloudFormation template. You can see the import (

Fn::ImportValue
) of a large number of resources from the AWS CloudFormation template that was launched when you started this lab. Thus the ECS-Storyizer-Deploy.yaml template will need a parameter to define the name of the original stack.

An Amazon ECS task is created for each Storyizer component in the ECS-Storyizer-Deploy.yaml template. When creating an Amazon ECS Task, you will have to define the image to be deployed. The image will be fetched from the Amazon ECR repository.

This is why repository URIs of those you created for each docker image are passed as stack parameters to the ECS-Storyizer-Deploy.yaml template. The template will apply the :latest tag to these URIs.

You will now deploy the ECS-Storyizer-Deploy.yaml stack. This stack will deploy the docker images to Amazon ECS.

    Copy this command to a text editor:

aws cloudformation create-stack --stack-name Storyizer-ECS-Deploy --template-body file://~/SPL-208-Resources/ECS-Storyizer-Deploy.yaml \
--parameters \
ParameterKey=BaseStack,\
ParameterValue="[BaseStackName]" \
ParameterKey=ECRsiteURIPram,\
ParameterValue="[Website-Repository-URI]" \
ParameterKey=ECRsaveURIPram,\
ParameterValue="[Save-Repository-URI]" \
ParameterKey=ECRapiURIPram,\
ParameterValue="[API-Repository-URI]"

    Replace the following values:

    [BaseStackName]: Replace with the value for BaseStackName shown to the left of these instructions.
    [Website-Repository-URI], [Save-Repository-URI], [API-Repository-URI]: Replace with the Repository URIs (the same as you did in a previous step).

    Run the updated commands in your session.

It will take a few minutes for the stack to complete. Use a waiter (

wait
in the command below), to keep polling the stack state, then query the outputs to get the DNS name of the Elastic Load Balancer to validate the deployment.

    Run the command below:

aws cloudformation wait stack-create-complete --stack-name Storyizer-ECS-Deploy

It might take a few minutes for the command to return, which indicates that the stack has been deployed.

You can now try the application!

    Copy the elbDNS value shown to the left of these instructions.

    Open a new web browser tab, paste the elbDNS into the address bar, then hit Enter.

    Click the ? button to view help for the application.

    Copy the sample sentence at the bottom of the help screen.

    Click return to app, then paste the sentence and click submit.

Your noun and verb placeholders should be replaced with random words.
Conclusion

Congratulations, your multi container Storyizer application is up and running. Through this process you’ve learned:

    The process for building Docker images and pushing them to Amazon ECR.
    Using AWS CloudFormation to deploy containers from a repository to an Amazon ECS cluster as highly availability Services.
    Utilize dynamic host port mapping to individual ECS tasks from the AWS ALB.

Docker Command Dictionary

Here is a short list of docker commands that might be helpful:

# Get a local Shell of container
      docker run -i -t --entrypoint /bin/bash imageID
# Create image using this directory's Dockerfile
      docker build -t friendlyname .
# Run "friendlyname" mapping port 4000 to 80
      docker run -p 4000:80 friendlyname
# Same thing, but in detached mode
      docker run -d -p 4000:80 friendlyname
# See a list of all running containers
     docker ps
# Gracefully stop the specified container
     docker stop <hash>
# See a list of all containers, even the ones not running
     docker ps -a
# Force shutdown of the specified container
     docker kill <hash>
 # Remove the specified container from this machine
     docker rm <hash>
# Remove all containers from this machine
     docker rm $(docker ps -a -q)
# Show all images on this machine
     docker images -a
# Remove the specified image from this machine
     docker rmi <imagename>
# Remove all images from this machine
     docker rmi $(docker images -q)
# Log in this CLI session using your Docker credentials
     docker login
# Tag <image> for upload to registry
     docker tag <image> username/repository:tag
# Upload tagged image to registry
     docker push username/repository:tag
# Run image from a registry
     docker run username/repository:tag

End lab

Follow these steps to close the console and end your lab.

    Return to the AWS Management Console.

    At the upper-right corner of the page, choose AWSLabsUser, and then choose Sign out.

    Choose End lab and then confirm that you want to end your lab.

Additional Resources

    For more AWS Self-Paced Labs, see http://amazon.qwiklabs.com.

For more information about AWS Training and Certification, see https://aws.amazon.com/training/.

Your feedback is welcome and appreciated.
If you would like to share any feedback, suggestions, or corrections, please provide the details in our AWS Training and Certification Contact Form.

