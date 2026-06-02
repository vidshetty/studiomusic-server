package mainrouter

import (
	"fmt"
	"os"
	"server_go/services/auth"
	"server_go/services/middlewares"
	reverseproxy "server_go/services/reverse_proxy"

	"github.com/gin-gonic/gin"
)

func Register(router *gin.RouterGroup) {

	// dashboard apis
	dashboardRouter := router.Group("/dashboard")
	{

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
		dashboardApiRouter := dashboardRouter.Group("/api", middlewares.Auth)
		{
			dashboardApiRouter.GET("/albums", reverseproxy.ProxyToStudioTs("/admin/albums"))
			dashboardApiRouter.POST("/album", reverseproxy.ProxyToStudioTs("/admin/album"))
			dashboardApiRouter.POST("/track", reverseproxy.ProxyToStudioTs("/admin/track"))
			dashboardApiRouter.GET("/object-id/albumId", reverseproxy.ProxyToStudioTs("/admin/object-id/album"))
			dashboardApiRouter.GET("/object-id/trackId", reverseproxy.ProxyToStudioTs("/admin/object-id/track"))
		}

	}

	// main
	router.GET("/lyrics", getLyrics)
	router.GET("/hls/listen/:track_title/:file_name", hlsListen)

}
