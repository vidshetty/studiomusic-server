package main

import (
	"fmt"
	"log"
	"net/http"
	mainrouter "server_go/routers/main-router"
	"server_go/services/auth"
	envhandler "server_go/services/env_handler"
	"server_go/services/redis"
	s3handler "server_go/services/s3_handler"

	"github.com/gin-gonic/gin"
)

func main() {

	envhandler.Init()
	s3handler.Init()
	if err := auth.Init(); err != nil {
		log.Fatalln("Failed to init auth", err)
	}
	redis.Init()

	if envhandler.GetEnv().Environment == envhandler.Enviroment_Production {
		gin.SetMode(gin.ReleaseMode)
	}

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
