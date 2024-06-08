path = "/usr/local/lib/python3.11/site-packages/opuslib/api/__init__.py"
o = ""
with open(path, "r") as f:
    for l in f.read().split("\n"):
        o += l.replace("find_library('opus')", "'libopus.so.0'") + "\n"

with open(path, "w") as f:
    f.write(o)
