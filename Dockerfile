FROM --platform=$BUILDPLATFORM debian:11 as needsquash
ARG TARGETPLATFORM
ARG TARGETARCH
SHELL ["/bin/bash", "--login", "-c"]

#WE ARE BUILDING ALWAYS WITHOUT CACHE
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install curl unzip wget procps gcc-10-aarch64-linux-gnu -y
RUN cp /usr/aarch64-linux-gnu/lib/* /lib/
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*do

#### install go && bombardier
RUN wget https://go.dev/dl/go1.19.1.linux-$TARGETARCH.tar.gz
RUN rm -rf /usr/local/go && tar -C /usr/local -xzf go1.19.1.linux-$TARGETARCH.tar.gz
RUN echo 'export PATH=$PATH:/usr/local/go/bin:~/go/bin' >> ~/.bashrc
RUN source ~/.bashrc
RUN go install github.com/codesenberg/bombardier@latest
RUN rm go1.19.1.linux-$TARGETARCH.tar.gz

### install bun
RUN curl https://bun.sh/install | bash
RUN echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
RUN echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
RUN source ~/.bashrc
RUN bun upgrade --canary


### install node
RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
RUN nvm install node


### install deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
RUN echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
RUN echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
RUN source ~/.bashrc



COPY ./entrypoint.sh /
COPY ./benchmarks/ ./var/benchmarks

FROM scratch
COPY --from=needsquash / /
WORKDIR /var/benchmarks
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]