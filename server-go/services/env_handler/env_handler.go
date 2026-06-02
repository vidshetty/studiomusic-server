package envhandler

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Enviroment string

const (
	Environment_Local     Enviroment = "LOCAL"
	Enviroment_Production Enviroment = "PRODUCTION"
)

type env struct {
	Environment                  Enviroment
	Port                         string
	AwsAccessKeyId               string
	AwsSecretKey                 string
	AwsRegion                    string
	AwsBucketName                string
	JWTSecret                    string
	GoogleClientID               string
	GoogleClientSecret           string
	AuthRedirectURL              string
	AuthState                    string
	StudioMusicTsServerTargetURL string
	AdminAccess                  string
}

func Init() {

	cwd, cwderr := os.Getwd()

	if cwderr != nil {
		log.Panicln("Error getting cwd!", cwderr)
	}

	err := godotenv.Load(cwd + "/.env")

	if err != nil {
		log.Panic("Error in loading env!", err)
	}

}

func GetEnv() *env {
	return &env{
		Environment:                  Enviroment(os.Getenv("ENVIRONMENT")),
		Port:                         os.Getenv("PORT"),
		AwsAccessKeyId:               os.Getenv("AWS_ACCESS_KEY_ID"),
		AwsSecretKey:                 os.Getenv("AWS_SECRET_KEY"),
		AwsRegion:                    os.Getenv("AWS_REGION"),
		AwsBucketName:                os.Getenv("AWS_BUCKET_NAME"),
		JWTSecret:                    os.Getenv("JWT_SECRET"),
		GoogleClientID:               os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:           os.Getenv("GOOGLE_CLIENT_SECRET"),
		AuthRedirectURL:              os.Getenv("AUTH_REDIRECT_URL"),
		AuthState:                    os.Getenv("AUTH_STATE"),
		StudioMusicTsServerTargetURL: os.Getenv("STUDIO_MUSIC_TS_SERVER_TARGET_URL"),
		AdminAccess:                  os.Getenv("ADMIN_ACCESS"),
	}
}
