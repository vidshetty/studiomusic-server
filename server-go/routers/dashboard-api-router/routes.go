package dashboardapirouter

import (
	reverseproxy "server_go/services/reverse_proxy"

	"github.com/gin-gonic/gin"
)

func Register(dashboardApiRouter *gin.RouterGroup) {

	dashboardApiRouter.GET("/albums", reverseproxy.ProxyToStudioTs("/admin/albums"))
	dashboardApiRouter.POST("/album", reverseproxy.ProxyToStudioTs("/admin/album"))
	dashboardApiRouter.POST("/track", reverseproxy.ProxyToStudioTs("/admin/track"))
	dashboardApiRouter.GET("/object-id/albumId", reverseproxy.ProxyToStudioTs("/admin/object-id/album"))
	dashboardApiRouter.GET("/object-id/trackId", reverseproxy.ProxyToStudioTs("/admin/object-id/track"))

}
