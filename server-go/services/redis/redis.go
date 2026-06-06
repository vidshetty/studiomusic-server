package redis

import (
	"context"
	"fmt"
	envhandler "server_go/services/env_handler"

	"github.com/redis/go-redis/v9"
)

var (
	redisClient     *redis.Client = nil
	clientAvailable bool          = false
)

func Init() {

	r := redis.NewClient(&redis.Options{
		Addr:     envhandler.GetEnv().RedisUrl,
		Password: envhandler.GetEnv().RedisPassword,
		DB:       0,
	})

	if err := r.Ping(context.TODO()).Err(); err != nil {
		fmt.Println("Failed to connect to Redis: " + err.Error())
		return
	}

	fmt.Println(r.Ping(context.TODO()).String())

	redisClient = r
	clientAvailable = true

}

func GetClient() *redis.Client {
	return redisClient
}

func ClientAvailable() bool {
	return clientAvailable
}
