FROM --platform=$TARGETPLATFORM debian:11 as needsquash
ARG TARGETPLATFORM
ARG TARGETARCH
ARG BUILDPLATFORM

SHELL ["/bin/bash", "--login", "-c"]

#WE ARE BUILDING ALWAYS WITHOUT CACHE
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install curl unzip wget procps -y
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

#### install go && bombardier
RUN wget https://go.dev/dl/go1.19.1.linux-$TARGETARCH.tar.gz
RUN rm -rf /usr/local/go && tar -C /usr/local -xzf go1.19.1.linux-$TARGETARCH.tar.gz
RUN echo 'export PATH=$PATH:/usr/local/go/bin:~/go/bin' >> ~/.bashrc
RUN source ~/.bashrc
RUN go install github.com/codesenberg/bombardier@latest
RUN rm go1.19.1.linux-$TARGETARCH.tar.gz

### install bun
RUN curl https://bun.sh/install > ./install.sh && chmod a+x ./install.sh
RUN ./install.sh canary
RUN echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
RUN echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
RUN source ~/.bashrc
RUN bun --version
RUN rm ./install.sh


### install node
RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
RUN nvm install node


### install deno
RUN curl -fsSL https://gist.githubusercontent.com/LukeChannings/09d53f5c364391042186518c8598b85e/raw/ac8cd8c675b985edd4b3e16df63ffef14d1f0e24/deno_install.sh | sh
RUN echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
RUN echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
RUN source ~/.bashrc



COPY ./entrypoint.sh /
COPY ./benchmarks/ ./var/benchmarks

FROM scratch
COPY --from=needsquash / /
WORKDIR /var/benchmarks
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]