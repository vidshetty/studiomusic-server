package logger

import "fmt"

type Logger struct {
	api  string
	logs []string
}

func (logger *Logger) Print() {
	fmt.Println()
	fmt.Println("----------")
	fmt.Println("API", logger.api)
	for i, log := range logger.logs {
		fmt.Println(i, "->", log)
	}
	fmt.Println("----------")
	fmt.Println()
}

func (logger *Logger) Add(log string) {
	logger.logs = append(logger.logs, log)
}

func NewLogger(api string) *Logger {
	return &Logger{
		api:  api,
		logs: []string{},
	}
}
