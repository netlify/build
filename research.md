# Other CI/CD config research

Examples of other CI/CD configuration files.

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [Travis](#travis)
- [AWS codeBuild](#aws-codebuild)
- [GCP cloudBuild](#gcp-cloudbuild)
- [Circle CI](#circle-ci)
- [Codeship CI](#codeship-ci)
- [Github Actions](#github-actions)
- [Gitlab CI](#gitlab-ci)
- [Serverless lifecycle](#serverless-lifecycle)
- [Other CI tools](#other-ci-tools)
<!-- AUTO-GENERATED-CONTENT:END -->

## [Travis](https://docs.travis-ci.com/user/job-lifecycle)

Note: named keys like `before_install` are lifecycle

```yml
sudo: required

language: ruby

services:
  - docker

before_install:
  - echo "Testing Docker Hub credentials"
  - docker login -e=$DOCKER_EMAIL -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD
  - echo "Docker Hub credentials are working"
  - docker build -t build-springxd-base .

script:
  - docker ps -a

after_success:
  - echo "Test Success - Branch($TRAVIS_BRANCH) Pull Request($TRAVIS_PULL_REQUEST) Tag($TRAVIS_TAG)"
  - if [[ "$TRAVIS_BRANCH" == "master" ]]; then echo -e "Push Container to Docker Hub"; fi
  - docker login -e=$DOCKER_EMAIL -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD
  - export REPO=jayjohnson/springxd-base
  - export TAG=`if [ "$TRAVIS_BRANCH" == "master" ]; then echo "latest"; else echo $TRAVIS_BRANCH ; fi`
  - docker build -f Dockerfile -t $REPO:$COMMIT .
  - docker tag $REPO:$COMMIT $REPO:$TAG
  - docker tag $REPO:$COMMIT $REPO:travis-$TRAVIS_BUILD_NUMBER
  - docker push $REPO
```


# [AWS codeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec-ref-syntax)

Notes: `phases` is lifecycle

```yml
version: 0.2

phases:
  install:
    runtime-versions:
      java: openjdk8
  build:
    commands:
      - echo Build started on `date`
      - mvn test
  post_build:
    commands:
      - echo Build completed on `date`
      - mvn package
artifacts:
  files:
    - target/my-app-1.0-SNAPSHOT.jar
    - appspec.yml
  discard-paths: yes
```


# [GCP cloudBuild](https://cloud.google.com/cloud-build/docs/configuring-builds/create-basic-configuration) [video](https://www.youtube.com/watch?v=iyGHW4UQ_Ts)

Note: `steps` array is lifecycle

```yml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/my-project/my-image', '.']
  timeout: 500s
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/my-project/my-image']
- name: 'gcr.io/cloud-builders/kubectl'
  args: ['set', 'image', 'deployment/my-deployment', 'my-container=gcr.io/my-project/my-image']
  env:
  - 'CLOUDSDK_COMPUTE_ZONE=us-east4-b'
  - 'CLOUDSDK_CONTAINER_CLUSTER=my-cluster'
options:
    machineType: 'N1_HIGHCPU_8'
timeout: 660s
tags: ['mytag1', 'mytag2']
images: ['gcr.io/my-project/myimage']
```

# [Circle CI](https://circleci.com/docs/2.0/sample-config/#sample-configuration-with-sequential-workflow)

```yml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # The primary container is an instance of the first image listed. The job's commands run in this container.
    docker:
      - image: circleci/node:4.8.2-jessie
    # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: Update npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: Install npm wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - node_modules
  test:
    docker:
      - image: circleci/node:4.8.2-jessie
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: Test
          command: npm test
      - run:
          name: Generate code coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts:
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage

workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
          filters:
            branches:
              only: master
```

# [Codeship CI](https://documentation.codeship.com/pro/builds-and-configuration/steps/#parallelizing-steps-and-tests)

Note: lifecycle in seperate file `codeship-steps.yml`

```
# codeship-steps.yml
- name: foo_step
  tag: master
  service: app
  command: echo foo
- name: bar_step
  service: app
  command: echo bar
```

# [Github Actions](https://help.github.com/en/articles/creating-a-workflow-with-github-actions)

```hcl
workflow "Build and deploy on push" {
  on = "push"
  resolves = ["zola deploy"]
}

action "zola deploy" {
  uses = "shalzz/zola-deploy-action@master"
  secrets = ["TOKEN"]
  env = {
    PAGES_BRANCH = "master"
  }
}
```

# [Gitlab CI](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_four.html)

```yml
image: ruby:2.3

cache:
  paths:
  - vendor/

before_script:
  - bundle install --path vendor

pages:
  stage: deploy
  script:
  - bundle exec jekyll build -d public
  artifacts:
    paths:
    - public
  only:
  - master

test:
  stage: test
  script:
  - bundle exec jekyll build -d test
  artifacts:
    paths:
    - test
  except:
  - master
```

# [Serverless lifecycle](https://gist.github.com/HyperBrain/50d38027a8f57778d5b0f135d80ea406) & [Custom hooks](https://www.npmjs.com/package/serverless-scriptable-plugin)

```yml
custom:
 scriptHooks:
   after:package:createDeploymentArtifacts:
     - build/serverless/add-log-subscriptions.js
     - build/serverless/add-dynamodb-auto-scaling.js
```

# [Other CI tools](https://github.com/ligurio/awesome-ci)
