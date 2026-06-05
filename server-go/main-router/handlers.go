package mainrouter

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	envhandler "server_go/services/env_handler"
	"server_go/services/logger"
	s3handler "server_go/services/s3_handler"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
)

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

	result, err := s3handler.GetS3Client().GetObject(c, &s3.GetObjectInput{
		Bucket: aws.String(envhandler.GetEnv().AwsBucketName),
		Key:    aws.String("lyrics/" + name + ".json"),
	})

	if err != nil {
		return
	}

	defer result.Body.Close()

	body, err := io.ReadAll(result.Body)
	if err != nil {
		return
	}

	var data any
	if err := json.Unmarshal(body, &data); err != nil {
		return
	}

	c.JSON(http.StatusOK, data)

}

func uploadLyrics(c *gin.Context) {

	logger := logger.NewLogger("/uploadLyrics")

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

	filename := c.PostForm("filename")

	logger.Add(fmt.Sprintf("filename %s", filename))

	if filename == "" {
		err = errors.New("filename is required!")
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		err = errors.Join(errors.New("error getting the file!"), err)
		return
	}

	src, err := file.Open()
	if err != nil {
		err = errors.Join(errors.New("error opening the file!"), err)
		return
	}

	defer src.Close()

	body, err := io.ReadAll(src)
	if err != nil {
		err = errors.Join(errors.New("error reading the file!"), err)
		return
	}

	reader := bytes.NewReader(body)

	_, err = s3handler.GetS3Client().PutObject(c, &s3.PutObjectInput{
		Bucket:        aws.String(envhandler.GetEnv().AwsBucketName),
		Key:           aws.String("lyrics/" + filename),
		Body:          reader,
		ContentType:   aws.String("application/json"),
		ContentLength: aws.Int64(int64(len(body))),
	})
	if err != nil {
		err = errors.Join(errors.New("error pushing to s3!"), err)
		return
	}

	c.JSON(200, gin.H{
		"key": "lyrics/" + filename,
	})

}

func uploadTrack(c *gin.Context) {

	logger := logger.NewLogger("/uploadTrack")

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

	trackTitle := c.PostForm("track_title")

	logger.Add(fmt.Sprintf("track title %s", trackTitle))

	if trackTitle == "" {
		err = errors.New("track title is required!")
		return
	}

	convertedTitle := convertTitleForFolder(trackTitle)

	logger.Add(fmt.Sprintf("converted title %s", convertedTitle))

	file, err := c.FormFile("file")
	if err != nil {
		err = errors.New("no file found!")
		return
	}

	logger.Add(fmt.Sprintf("uploaded file size %d", file.Size))

	tempDir := "temp"

	err = os.MkdirAll(tempDir, os.ModePerm)
	if err != nil {
		err = errors.Join(errors.New("failed to create a temp folder!"), err)
		return
	}

	defer func() {
		err = os.RemoveAll(tempDir)
		if err != nil {
			fmt.Println("error deleting temp folder", err.Error())
		}
	}()

	inputPath := fmt.Sprintf("%s/%s%s", tempDir, file.Filename, filepath.Ext(file.Filename))

	logger.Add(fmt.Sprintf("input path %s", inputPath))

	err = c.SaveUploadedFile(file, inputPath)
	if err != nil {
		err = errors.Join(errors.New("error in saving file in temp folder!"), err)
		return
	}

	outputDir := fmt.Sprintf("%s/%s", tempDir, convertedTitle)

	logger.Add(fmt.Sprintf("output dir %s", outputDir))

	err = os.MkdirAll(outputDir, os.ModePerm)
	if err != nil {
		err = errors.Join(errors.New("error creating hls folder!"), err)
		return
	}

	m3u8Path := fmt.Sprintf("%s/output.m3u8", outputDir)

	logger.Add(fmt.Sprintf("m3u8 path %s", m3u8Path))

	command := exec.Command("ffmpeg",
		"-i", inputPath,
		"-profile:v", "baseline",
		"-level", "3.0",
		"-b:a", "192k",
		"-start_number", "0",
		"-hls_time", "10",
		"-hls_list_size", "0",
		"-f", "hls",
		m3u8Path,
	)

	var stderr bytes.Buffer
	command.Stderr = &stderr

	err = command.Run()
	if err != nil {
		logger.Add(fmt.Sprintf("error in ffmpeg -> %s", stderr.String()))
		err = errors.New("error in ffmpeg! -> " + stderr.String())
		return
	}

	files, err := os.ReadDir(outputDir)
	if err != nil {
		logger.Add(fmt.Sprintf("error reading from hls folder! -> %s", err.Error()))
		err = errors.Join(errors.New("error reading from hls folder!"), err)
		return
	}

	logger.Add(fmt.Sprintf("files in outputDir %d", len(files)))

	for _, f := range files {

		filePath := fmt.Sprintf("%s/%s", outputDir, f.Name())

		fileData, err := os.Open(filePath)
		if err != nil {
			err = errors.Join(errors.New("error in reading file of hls folder! "+f.Name()), err)
			return
		}

		defer fileData.Close()

		contentType := "video/MP2T"

		if filepath.Ext(f.Name()) == ".m3u8" {
			contentType = "application/x-mpegURL"
		}

		s3Key := fmt.Sprintf("%s/%s/%s", "tracks", convertedTitle, f.Name())

		_, err = s3handler.GetS3Client().PutObject(c, &s3.PutObjectInput{
			Bucket:      aws.String(envhandler.GetEnv().AwsBucketName),
			Key:         aws.String(s3Key),
			Body:        fileData,
			ContentType: aws.String(contentType),
		})
		if err != nil {
			err = errors.Join(errors.New("failed to push to s3! "+f.Name()), err)
			return
		}

	}

	c.JSON(http.StatusOK, gin.H{
		"message": "track uploaded successfully!",
		"location": fmt.Sprintf(
			"%s/%s/%s",
			envhandler.GetEnv().AwsBucketName,
			"tracks",
			convertedTitle,
		),
	})

}

func hlsListen(c *gin.Context) {

	fmt.Println("headers", c.Request.Header)

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

	fmt.Println("s3 key", s3Key)

	result, err := s3handler.GetS3Client().GetObject(c, &s3.GetObjectInput{
		Bucket: aws.String(envhandler.GetEnv().AwsBucketName),
		Key:    aws.String(s3Key),
	})
	if err != nil {
		err = errors.Join(errors.New("error reading file from s3!"), err)
		return
	}

	defer result.Body.Close()

	c.Header(
		"Content-Type",
		func() string {
			if filepath.Ext(fileName) == ".m3u8" {
				return "application/x-mpegURL"
			}
			return "video/MP2T"
		}(),
	)

	io.Copy(c.Writer, result.Body)

}
