# Use the official Golang image to create a build artifact.
# This is based on Debian and sets the GOPATH to /go.
FROM golang:1.16.2-alpine as builder
ARG version=develop

WORKDIR /go/src/github.com/keptn/keptn/secret-service

# Force the go compiler to use modules
ENV GO111MODULE=on
ENV BUILDFLAGS=""
ENV GOPROXY=https://proxy.golang.org

RUN apk add --no-cache gcc libc-dev git

# Copy `go.mod` for definitions and `go.sum` to invalidate the next layer
# in case of a change in the dependencies
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy local code to the container image.
COPY . .

ENV REPLACE="version: ${version}"

# `skaffold debug` sets SKAFFOLD_GO_GCFLAGS to disable compiler optimizations
ARG SKAFFOLD_GO_GCFLAGS

# Build the command inside the container.
# (You may fetch or manage dependencies here,
# either manually or with a tool like "godep".)
RUN GOOS=linux go build -ldflags '-linkmode=external' -gcflags="${SKAFFOLD_GO_GCFLAGS}" -v main.go

# Use a Docker multi-stage build to create a lean production image.
FROM alpine:3.13

ENV env=production

# we need to install ca-certificates and libc6-compat for go programs to work properly
RUN apk add --no-cache ca-certificates libc6-compat

# Copy the binary to the production image from the builder stage.
COPY --from=builder /go/src/github.com/keptn/keptn/secret-service/main /secret-service
COPY --from=builder /go/src/github.com/keptn/keptn/secret-service/swagger-ui /swagger-ui

RUN sed -i "s|basePath: /v1|basePath: /api/secrets/v1 |g" /swagger-ui/docs/swagger.yaml

EXPOSE 8080

# required for external tools to detect this as a go binary
ENV GOTRACEBACK=all

# KEEP THE FOLLOWING LINES COMMENTED OUT!!! (they will be included within the travis-ci build)
#travis-uncomment ADD MANIFEST /
#travis-uncomment COPY entrypoint.sh /
#travis-uncomment ENTRYPOINT ["/entrypoint.sh"]

# Run the web service on container startup.
ENV GIN_MODE=release

ADD scopes.yaml /data/scopes.yaml

CMD ["/secret-service"]
