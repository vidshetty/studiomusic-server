package reverseproxy

import (
	"errors"
	"net/http"
	"net/http/httputil"
	"net/url"
	envhandler "server_go/services/env_handler"

	"github.com/gin-gonic/gin"
)

type ReverseProxyType string

const (
	StudioMusicTsServer ReverseProxyType = "studio-music-ts-server"
)

func server(proxyType ReverseProxyType) (*httputil.ReverseProxy, error) {

	var target string

	switch proxyType {
	case StudioMusicTsServer:
		{
			target = envhandler.GetEnv().StudioMusicTsServerTargetURL
		}
	default:
		{
			return nil, errors.New("invalid proxy type")
		}
	}

	targetURL, err := url.Parse(target)

	if err != nil {
		return nil, err
	}

	proxy := httputil.NewSingleHostReverseProxy(targetURL)

	proxy.ModifyResponse = func(resp *http.Response) error {
		resp.Header.Set("X-Proxy", "Server-Go")
		return nil
	}

	return proxy, nil

}

func ProxyToStudioTs(adminPath string) gin.HandlerFunc {
	return func(c *gin.Context) {

		proxy, err := server(StudioMusicTsServer)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		targetURL, err := url.Parse(envhandler.GetEnv().StudioMusicTsServerTargetURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		adminAccess := envhandler.GetEnv().AdminAccess

		proxy.Director = func(req *http.Request) {
			req.URL.Scheme = targetURL.Scheme
			req.URL.Host = targetURL.Host
			req.Host = targetURL.Host
			req.URL.Path = adminPath
			req.URL.RawQuery = c.Request.URL.RawQuery
			if adminAccess != "" {
				req.Header.Set("Authorization", adminAccess)
			}
		}

		proxy.ServeHTTP(c.Writer, c.Request)

	}
}
