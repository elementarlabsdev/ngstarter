#!/bin/bash

rm -rf dist/components
npm run build:components:prod
cd dist/components && npm link
npm pack --pack-destination ~
cd ../../
