package s3handler

import (
	"context"
	"log"
	envhandler "server_go/services/env_handler"
	"sync"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var (
	s3Client *s3.Client = nil
	once     sync.Once  = sync.Once{}
)

func Init() {
	once.Do(func() {

		cfg, err := config.LoadDefaultConfig(context.TODO(),
			config.WithRegion(envhandler.GetEnv().AwsRegion),
			config.WithCredentialsProvider(
				credentials.NewStaticCredentialsProvider(
					envhandler.GetEnv().AwsAccessKeyId,
					envhandler.GetEnv().AwsSecretKey,
					"",
				),
			),
		)

		if err != nil {
			log.Fatalln("error in initializing s3Client", err)
		}

		s3Client = s3.NewFromConfig(cfg)

	})
}

func GetS3Client() *s3.Client {
	Init()
	return s3Client
}
