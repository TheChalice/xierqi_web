package.path = package.path .. ";/usr/local/openresty/nginx/lualib/?.lua"


local authorize = require "comm.authorize"
local json = require "cjson"
local strutil = require "resty.string"

local api_server = os.getenv("API_SBNANJI_ADDR")

local redis_host = os.getenv("REDIS_HU_HOST")
local redis_port = strutil.atoi(os.getenv("REDIS_HU_PORT"))
local redis_password = os.getenv("REDIS_HU_PASSWORD")




local function sessionToken(username)
    local tokentool = authorize.new()
    local tokencache = tokentool:has_token(username,redis_host,redis_port,redis_password)

    if tokencache == ngx.null then

        local token = {}

        token = tokentool:auth(username,api_server)
        if token == ngx.null then
            ngx.log(ngx.ERR, "can not authorize by openshift.")
            ngx.status = 401
            return ngx.exit(401)
        end
        tokentool:add_bearer_token_ttl(username, token.expires_in, tokentool:auth_str(token.token_type, token.access_token),redis_host,redis_port,redis_password)
        local tokenjson = json.encode{ access_token = token.access_token }
        ngx.status = 200
        ngx.header["access_token"] = token.access_token
        ngx.say(tokenjson)
    else
        local tokenvalue = tokentool:split(tokencache,' ')
        local tokenjson = json.encode{ access_token = tokenvalue[2] }
        ngx.status = 200
        ngx.header["access_token"] = tokenvalue[2]
        ngx.say(tokenjson)
    end
    return
end




local cas_loginname = ngx.req.get_headers()["X-Forwarded-User"]

if not cas_loginname then

    ngx.log(ngx.ERR, "header 'X-Forwarded-User' not found.")
    nginx.status = 401
    return nginx.exit(401)
else
    sessionToken(cas_loginname)
end

