FROM node:12

WORKDIR /usr/src/app
# VOLUME [ "/user/src/app/src" ]
# COPY package*.json ./
# COPY node_modules node_modules


# RUN yarn install 

# copy app source code
# COPY . .

#expose port and start application
EXPOSE 80
CMD ["yarn", "start"]