package dashboardrouter

import (
	"fmt"
	"os"
	dashboardapirouter "server_go/routers/dashboard-api-router"
	"server_go/services/auth"
	"server_go/services/middlewares"

	"github.com/gin-gonic/gin"
)

func Register(dashboardRouter *gin.RouterGroup) {

	dashboardRouter.GET("/login", func(c *gin.Context) {
		cwd, _ := os.Getwd()
		fmt.Println("serving login.html", cwd)
		c.File(fmt.Sprintf("%s/dashboard/login.html", cwd))
	})
	dashboardRouter.GET("/auth/google", auth.RedirectToGoogle)
	dashboardRouter.GET("/auth/google/callback", auth.HandleGoogleCallback)
	dashboardRouter.GET("/auth/unauthorized", func(c *gin.Context) {
		cwd, _ := os.Getwd()
		c.File(fmt.Sprintf("%s/dashboard/unauthorized.html", cwd))
	})
	dashboardRouter.GET("/auth/logout", auth.Logout)

	// Dashboard: redirect to /login if not authenticated
	// Public assets (login / unauthorized pages need CSS + logo without a session)
	dashboardRouter.GET("/index.css", serveDashboardAsset("index.css"))

	dashboardRouter.GET("", middlewares.AuthRedirectToLogin, func(c *gin.Context) {
		cwd, _ := os.Getwd()
		c.File(fmt.Sprintf("%s/dashboard/index.html", cwd))
	})
	dashboardRouter.GET("/index.js", middlewares.AuthRedirectToLogin, func(c *gin.Context) {
		cwd, _ := os.Getwd()
		c.File(fmt.Sprintf("%s/dashboard/index.js", cwd))
	})
	dashboardRouter.GET("/favicon.ico", serveDashboardAsset("latest-blueblack-black.svg"))
	dashboardRouter.GET("/latest-blueblack-black.svg", serveDashboardAsset("latest-blueblack-black.svg"))

	dashboardRouter.POST("/lyrics", middlewares.AuthRedirectToLogin, uploadLyrics)
	dashboardRouter.POST("/track", middlewares.AuthRedirectToLogin, uploadTrack)

	// Proxied to studio-server-ts /admin
	dashboardapirouter.Register(dashboardRouter.Group("/api", middlewares.Auth))

}
