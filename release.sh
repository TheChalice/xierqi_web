dist=dist

echo "[build]"
npm run build > /dev/null

echo "[prepare]"
mkdir -p $dist/vendor

echo "[copy files]"
cp -r app/index_dist.html $dist/index.html
cp -r bower_components/bootstrap $dist/vendor/
cp -r bower_components/font-awesome $dist/vendor/
cp -r bower_components/html5-boilerplate $dist/vendor/
cp -r bower_components/requirejs $dist/vendor/
cp -r bower_components/jquery $dist/vendor/
cp -r bower_components/uri.js $dist/vendor/
cp -r bower_components/marked $dist/vendor/

echo "[I know this is not good, but I ...]"
mkdir -p $dist/app
cp app/oauth_dist.html $dist/app/oauth.html
rm $dist/oauth_dist.html
rm $dist/oauth.html

echo "[remove unconcerned files]"
rm $dist/index_dist.html

echo "[end]"
