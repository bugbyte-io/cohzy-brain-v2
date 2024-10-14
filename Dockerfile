# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.20.2
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.22
RUN npm install -g yarn@$YARN_VERSION --force


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

RUN npm install -g nodemon

# Copy application code
COPY . .

# List files after copying
RUN echo "Files in /app after COPY:" && ls -la /app && \
    echo "Files in /app/src after COPY:" && ls -la /app/src

# Build application
RUN yarn run build

# List files after build
RUN echo "Files in /app after build:" && ls -la /app && \
    echo "Files in /app/dist after build:" && ls -la /app/dist && \
    echo "Files in the root of /app/dist after build:" && ls -la /app/dist/*

# Remove development dependencies
RUN yarn install --production=true

FROM build AS debug
CMD ["bash"]

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# List files in the final image
RUN echo "Files in /app in final image:" && ls -la /app && \
    echo "Files in /app/dist in final image:" && ls -la /app/dist && \
    echo "Files in the root of /app/dist in final image:" && ls -la /app/dist/*

# Start the server by default, this can be overwritten at runtime
EXPOSE 80
CMD [ "sh", "-c", "node ./dist/src/index.js || (echo 'Application failed to start. Contents of /app/dist:' && ls -R /app/dist && exit 1)" ]
