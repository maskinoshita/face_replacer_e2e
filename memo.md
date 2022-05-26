# Face Replacer E2E

## 0. 準備

1. `git clone XXX.git && cd XXX`;
2. `.npmrc`を作成し、下記の設定を記述する。
   puppeteerのライブラリをインストールする際にchromiumをダウンロードしない設定。デプロイパッケージに含めるとクォータに引っかかるので、chromiumはLambda Layerで導入する。
   ```
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=TRUE
   ```
3. Pluginとライブラリをインストールする
    ```bash
    # LambdaのLayersのインストール
    sls plugin install --name serverless-layers
    # Jest, Jest-puppeteerのインストール (--save)なのに注意
    npm install --save jest jest-puppeteer
    ```
4. `jest.config.e2e.js`のファイルを作成し、下記の内容を設定する
    ```js
    module.exports = {
        preset: 'jest-puppeteer',
    }
    ```
5. LambdaLayers用のS3バケットを作成 `aws s3 mb s3://20220527-layers-bucket-[!!!固有の名前!!!]`で作成 (ex. `aws s3 mb s3://20220527-layers-bucket-mk`)
6. ChromiumとPuppeteer-coreをパッケージしたLambdaLayerを作る
    公式の方法がうまくいかないので手動で作成する。
    ```bash
    mkdir -p /tmp/nodejs
    cd /tmp/nodejs
    npm init -y
    npm i chrome-aws-lambda puppeteer-core
    rm package*
    cd ..
    zip -r chrome_aws_lambda.zip nodejs
    mv chrome_aws_lambda.zip [FaceReplacer E2E PROJECT folder]/
    ```
<!-- 6. `https://github.com/alixaxel/chrome-aws-lambda`を使って、chrominumが入ったLambdaレイヤーを作る
    ```bash
    # in host: run container
    sudo docker run -it amazonlinux:2 bash
    # in container
        yum update
        yum install -y git gcc make tar zip
        curl -fsSL https://rpm.nodesource.com/setup_14.x | bash -
        yum install --enablerepo=nodesource -y nodejs
        git clone --depth=1 https://github.com/alixaxel/chrome-aws-lambda.git
        cd chrome-aws-lambda
        npm install
        make chrome_aws_lambda.zip
        exit
    # in host: cp built chromium to host from container
    sudo docker ps -a -f ancestor=amazonlinux:2 --format "{{.Names}}" | xargs -I {} sudo docker cp "{}:/chrome-aws-lambda/chrome_aws_lambda.zip" .
    cp chrome-aws-lambda.zip [project folder]/
    # in host: remove container
    sudo docker ps -a -f ancestor=amazonlinux:2 --format "{{.ID}}" | xargs -I {} sudo docker rm -f {}
    ``` -->
   