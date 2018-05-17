package.path = package.path .. ";/usr/local/openresty/nginx/lualib/?.lua"


local authorize = require "comm.authorize"
local json = require "cjson"

local function sessionToken(username)
    local tokentool = authorize.new()
    local tokencache = tokentool:has_token(username)
    
    if tokencache == ngx.null then

        local token = {}

        token = tokentool:auth(username)
        if token == ngx.null then
            ngx.log(ngx.ERR, "can not authorize by openshift.")
            ngx.status = 401
            return ngx.exit(401)
        end
        tokentool:add_bearer_token_ttl(username, token.expires_in, tokentool:auth_str(token.token_type, token.access_token))
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


-- local request_uri = ngx.var.request_uri
-- ngx.say(request_uri)

local cas_loginname = ngx.req.get_headers()["X-Forwarded-User"]

if not cas_loginname then
    -- ngx.status = 401
    -- ngx.say("unauthorized")
    -- ngx.exit(401)
    ngx.log(ngx.ERR, "header 'X-Forwarded-User' not found.")
    nginx.status = 401
    return nginx.exit(401)
else
    sessionToken(cas_loginname)
end

