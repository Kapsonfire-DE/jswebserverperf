# JSWebserverPerf

## How to run
```shell
docker pull kapsonfirede/jswebserverperf
docker run --rm --mount type=bind,src="$(pwd)"/results,dst=/var/results kapsonfirede/jswebserverperf
```
The docker image will write the logs/results into `/var/results` - mount a local dir into the docker to `/var/results` to get the logs on the host.
Make sure the local dir on the host already exists.
