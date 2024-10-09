# import mmap

# with open("course-definition-repository.ts", "r+b") as f:
#     mm = mmap.mmap(f.fileno(), 0)
#     print(mm.readline())  # prints b"Hello Python!\n"
#     mm.close()


with open('course-definition-code333.ts') as f:
    if 'competition-1-301' in f.read():
        print("True")
    else:
        print("False")

    #f.close()

"""
Blender file path -> python path -> blender

pathlib, export.
"""