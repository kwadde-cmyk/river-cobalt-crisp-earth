ARCHES := x86 arm
SDK_MK := node_modules/@start9labs/start-sdk/s9pk.mk

# App image is the repo-root Dockerfile; pack ingredients look for a local name.
Dockerfile: ../../Dockerfile
	ln -sfn ../../Dockerfile Dockerfile

ifeq ($(wildcard $(SDK_MK)),)
.PHONY: universal x86 arm all
universal x86 arm all:
	@echo "In diesem Ordner zuerst:  npm ci"
	@echo "Dann z. B.:               make x86"
	@echo "  oder beide Archs:       make universal"
	@echo "(start-cli, Docker, Node 22 müssen installiert sein)"
	@exit 1
else
include $(SDK_MK)
endif
