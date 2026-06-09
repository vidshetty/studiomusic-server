package mainrouter

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	envhandler "server_go/services/env_handler"
	"server_go/services/logger"
	"server_go/services/redis"
	s3handler "server_go/services/s3_handler"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
)

// types

type LyricsData struct {
	StartTimeMs string `json:"startTimeMs"`
	Words       string `json:"words"`
}

type SpotifyLyrics struct {
	StartTimeMs int    `json:"startTimeMs"`
	Words       string `json:"words"`
}

// helpers

func convertTitleForFolder(title string) string {
	symbols := map[rune]bool{
		'-':  true,
		'/':  true,
		'"':  true,
		'\'': true,
	}
	name := ""
	for _, char := range title {
		if char == ' ' {
			continue
		}
		if _, exists := symbols[char]; exists {
			name += "_"
		} else {
			name += string(char)
		}
	}
	return name
}

func convertNameForLyrics(name string) string {
	symbols := map[rune]bool{
		'"': true,
		':': true,
	}
	newName := ""
	for _, char := range name {
		if _, exists := symbols[char]; exists {
			newName += ""
		} else {
			newName += string(char)
		}
	}
	return newName
}

func fetchFromRedis(ctx context.Context, s3Key string, logger *logger.Logger) ([]byte, error) {

	logger.Add("fetching from redis")

	if !redis.ClientAvailable() {
		logger.Add("redis not available!")
		return nil, errors.New("redis not available!")
	}

	data, err := redis.GetClient().Get(ctx, s3Key).Bytes()

	if err == nil {
		logger.Add("redis hit!")
		return data, nil
	}

	if err != redis.Nil {
		logger.Add("error in fetching from redis -> " + err.Error())
		return nil, err
	}

	logger.Add("not found in redis")

	return nil, nil

}

func fetchFromS3(ctx context.Context, s3Key string, logger *logger.Logger) ([]byte, error) {

	logger.Add("fetching from s3")

	result, err := s3handler.GetS3Client().GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(envhandler.GetEnv().AwsBucketName),
		Key:    aws.String(s3Key),
	})

	if err != nil {
		err = errors.Join(errors.New("error reading file from s3!"), err)
		return nil, err
	}

	defer result.Body.Close()

	data, err := io.ReadAll(result.Body)

	if err != nil {
		logger.Add("error in reading from body -> " + err.Error())
		return nil, err
	}

	return data, err

}

func storeInRedis(ctx context.Context, s3Key string, data []byte, logger *logger.Logger) error {

	logger.Add("storing in redis")

	if !redis.ClientAvailable() {
		logger.Add("redis not available!")
		return errors.New("redis not available!")
	}

	ttl, err := strconv.Atoi(envhandler.GetEnv().RedisTTL)
	if err != nil {
		logger.Add("error in converting ttl -> " + err.Error())
		ttl = 10
	}

	err = redis.GetClient().Set(ctx, s3Key, data, time.Duration(ttl)*time.Minute).Err()

	if err != nil {
		logger.Add("failed to cache data -> " + err.Error())
		return err
	}

	return nil

}

// handlers

func getLyrics(c *gin.Context) {

	logger := logger.NewLogger("/getLyrics")

	defer func() {
		logger.Print()
	}()

	var err error = nil

	defer func() {
		if err == nil {
			return
		}
		c.JSON(500, gin.H{
			"message": err.Error(),
		})
	}()

	name := c.Query("name")

	logger.Add(fmt.Sprintf("query name %s", name))

	if name == "" {
		err = errors.New("invalid name!")
		return
	}

	convertedName := convertNameForLyrics(name)

	logger.Add(fmt.Sprintf("converted name -> %s", convertedName))

	result, err := s3handler.GetS3Client().GetObject(c, &s3.GetObjectInput{
		Bucket: aws.String(envhandler.GetEnv().AwsBucketName),
		Key:    aws.String("lyrics/" + convertedName + ".json"),
	})

	if err != nil {
		return
	}

	defer result.Body.Close()

	body, err := io.ReadAll(result.Body)
	if err != nil {
		return
	}

	type LyricsReturnData struct {
		StartTimeMs int    `json:"startTimeMs"`
		Words       string `json:"words"`
		Key         int    `json:"key"`
	}

	var data []LyricsReturnData
	if err = json.Unmarshal(body, &data); err != nil {
		logger.Add("err in unmarshal -> " + err.Error())
		return
	}

	for i := 0; i < len(data); i++ {
		data[i].Key = i
	}

	c.JSON(http.StatusOK, data)

}

func hlsListen(c *gin.Context) {

	logger := logger.NewLogger("/hls/listen")

	defer func() {
		logger.Print()
	}()

	var err error = nil

	defer func() {
		if err == nil {
			return
		}
		fmt.Println("error in hls listen!", err.Error())
		c.AbortWithStatus(500)
	}()

	trackTitle := c.Param("track_title")
	if trackTitle == "" {
		err = errors.New("track title is required!")
		return
	}

	fileName := c.Param("file_name")
	if fileName == "" {
		err = errors.New("file name is required!")
		return
	}

	convertedTitle := convertTitleForFolder(trackTitle)
	s3Key := fmt.Sprintf("%s/%s/%s", "tracks", convertedTitle, fileName)

	logger.Add("s3 key -> " + s3Key)

	foundInRedis := true

	data, err := fetchFromRedis(c, s3Key, logger)

	if data == nil {
		foundInRedis = false
		data, err = fetchFromS3(c, s3Key, logger)
		if err != nil {
			return
		}
	}

	if !foundInRedis {
		_ = storeInRedis(c, s3Key, data, logger)
	}

	c.Header(
		"Content-Type",
		func() string {
			if filepath.Ext(fileName) == ".m3u8" {
				return "application/x-mpegURL"
			}
			return "video/MP2T"
		}(),
	)

	reader := bytes.NewReader(data)

	if _, err = io.Copy(c.Writer, reader); err != nil {
		logger.Add("error in io.Copy -> " + err.Error())
		return
	}

}
