# this is extremely hacky and will only work for this one time :)

# it seems that fly.io CLI somehow builds the image differently from
# pure docker and just hangs, consuming one full core; so instead of
# building and deploying, build separately through docker and then
# just reuse the image
# current workflow:
# docker build --progress plain -f apps/huppy/Dockerfile -t dgroshev/huppy --platform linux/amd64 .
# docker push dgroshev/huppy
# [adjust the image hash below]
# fly deploy --config apps/huppy/fly.toml --dockerfile apps/huppy/hacky.Dockerfile --local-only
FROM dgroshev/huppy@sha256:3dd947e860cb919ba8b5147f51b286ee413057c12bc973d021fbe8313f28401c