dist=dist

echo "[build]"
npm run build


echo "[prepare]"
mkdir -p $dist/vendor

echo "[copy files]"
cp -r app/index.html $dist/index.html
cp -r bower_components/bootstrap $dist/vendor/
cp -r bower_components/angularjs-slider $dist/vendor/
cp -r bower_components/font-awesome $dist/vendor/
cp -r bower_components/html5-boilerplate $dist/vendor/
cp -r bower_components/requirejs $dist/vendor/
cp -r bower_components/marked $dist/vendor/
cp -r bower_components/kubernetes-container-terminal $dist/vendor/
cp -r bower_components/angular-tree-control $dist/vendor/
cp -r bower_components/angular-patternfly $dist/vendor/

set -v
echo "[post processing]"

sed -i 's~="../bower_components/~="./vendor/~g' $dist/index.html

echo "[end]"
