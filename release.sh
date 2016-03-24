dist=dist

echo "[build]"
npm run build > /dev/null

echo "[prepare]"
mkdir -p $dist/bower_components

echo "[copy files]"
cp -r bower_components/bootstrap $dist/bower_components/
cp -r bower_components/font-awesome $dist/bower_components/
cp -r bower_components/html5-boilerplate $dist/bower_components/
cp -r bower_components/requirejs $dist/bower_components/

echo "[end]"
