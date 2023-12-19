# dont copy in hardware-files. should mount a readonly docker volume
# volume should be the same across hardware mock and here
# https://docs.docker.com/storage/volumes/
# https://docs.docker.com/storage/volumes/#use-a-volume-with-docker-compose

# location for files: /hardware:
# BASEPATH should be /hardware

FROM node:latest