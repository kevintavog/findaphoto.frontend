
BUILD_ID:=$(shell date +%s)

.PHONY: dist

build: dist image push

dist:
	npm run build

image:
	docker build  . -t docker.rangic:6000/findaphoto.frontend:${BUILD_ID}

push:
	docker push docker.rangic:6000/findaphoto.frontend:${BUILD_ID}

run:
	http-server dist/ -p 8888

run-docker:
	@docker stop findaphoto.frontend || true
	docker run -d -p 80:80 --rm --name findaphoto.frontend docker.rangic:6000/findaphoto.frontend:${BUILD_ID}
