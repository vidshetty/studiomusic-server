package main

import (
	"fmt"
	"log"
	"net/http"
	mainrouter "server_go/main-router"
	envhandler "server_go/services/env_handler"
	s3handler "server_go/services/s3_handler"

	"github.com/gin-gonic/gin"
)

func main() {

	envhandler.Init()
	s3handler.Init()

	app := gin.Default()

	mainrouter.Register(app.Group("/"))

	server := http.Server{
		Addr:    envhandler.GetEnv().Port,
		Handler: app,
	}

	fmt.Println("running server now!")

	if err := server.ListenAndServe(); err != nil {
		log.Fatalln("Failed to start server_go", err)
	}

}
