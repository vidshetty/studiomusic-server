run:
	go run main.go

build-macos:
	go build -trimpath -o bin/macos/server-go .

build-linux-x86_64:
	GOOS=linux GOARCH=amd64 go build -trimpath -o bin/linux/x86_64/server-go .

build-linux-arm64:
	GOOS=linux GOARCH=arm64 go build -trimpath -o bin/linux/arm64/server-go .

build:
	make build-macos && \
	make build-linux-x86_64 && \
	make build-linux-arm64