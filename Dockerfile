FROM debian:11 as needsquash
SHELL ["/bin/bash", "--login", "-c"]
#WE ARE BUILDING ALWAYS WITHOUT CACHE
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install curl unzip -y
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

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
ENTRYPOINT ["/entrypoint.sh"]