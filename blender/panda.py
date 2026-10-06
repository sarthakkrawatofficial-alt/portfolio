"""
Procedural panda mascot for the portfolio hero.
Run:  python blender/panda.py <out.glb> [preview.png]   (needs the `bpy` package, Blender 4.2)
Blender is Z-up, the character faces -Y. glTF export converts to Y-up.
Head parts are parented to the empty "HeadRig" so the site can animate the head.
"""
import sys, math
import bpy
from mathutils import Vector

OUT = sys.argv[-2] if sys.argv[-1].endswith(".png") else sys.argv[-1]
PREVIEW = sys.argv[-1] if sys.argv[-1].endswith(".png") else None

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------- materials ----------
def mat(name, rgb, rough=0.8, metal=0.0, coat=0.0, sheen=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Sheen Weight"].default_value = sheen
    return m

def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

M = {
    "fur_white": mat("FurWhite", srgb("#f1ede6"), 0.95, sheen=0.6),
    "fur_black": mat("FurBlack", srgb("#1b1a1c"), 0.95, sheen=0.4),
    "hoodie": mat("Hoodie", srgb("#161618"), 0.92),
    "cream": mat("Cream", srgb("#e7dfd0"), 0.9),
    "pants": mat("Pants", srgb("#1d1d20"), 0.9),
    "lens": mat("Lens", srgb("#0b0b0d"), 0.06, metal=0.3, coat=1.0),
    "sole": mat("Sole", srgb("#efe9df"), 0.6),
    "shoe": mat("Shoe", srgb("#e9e3d8"), 0.55),
    "shoe_dark": mat("ShoeDark", srgb("#232326"), 0.5),
    "nose": mat("Nose", srgb("#121112"), 0.35, coat=0.6),
    "bag": mat("Backpack", srgb("#141416"), 0.75),
    "zip": mat("Zip", srgb("#9a968f"), 0.35, metal=0.8),
}

def shade(o, subdiv=2):
    if subdiv:
        mod = o.modifiers.new("sub", "SUBSURF")
        mod.levels = subdiv
        mod.render_levels = subdiv
    for p in o.data.polygons:
        p.use_smooth = True
    return o

def put(o, m, name, parent=None):
    o.name = name
    o.data.materials.clear()
    o.data.materials.append(M[m])
    if parent:
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o

def sphere(name, m, loc, scale, rot=(0, 0, 0), seg=32, ring=16, subdiv=1, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, radius=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = scale
    return put(shade(o, subdiv), m, name, parent)

def box(name, m, loc, size, rot=(0, 0, 0), bevel=0.04, subdiv=0, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = o.modifiers.new("bev", "BEVEL")
        b.width = bevel
        b.segments = 4
    return put(shade(o, subdiv), m, name, parent)

def limb(name, m, a, b, r, parent=None):
    """capsule between points a and b"""
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.object
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    put(shade(o, 1), m, name, parent)
    for i, p in enumerate((a, b)):
        sphere(f"{name}_cap{i}", m, p, (r, r, r), seg=24, ring=12, subdiv=1, parent=parent)
    return o

def tube(name, m, pts, r, parent=None):
    """smooth bent sleeve: bezier curve with a round bevel and capped ends"""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    cu.resolution_u = 16
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    o = bpy.data.objects.new(name, cu)
    scene.collection.objects.link(o)
    o.data.materials.append(M[m])
    sphere(f"{name}_end", m, pts[-1], (r * 0.98, r * 0.98, r * 0.98), seg=24, ring=12, subdiv=1, parent=parent)
    if parent:
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o

# ---------- body ----------
root = bpy.data.objects.new("Panda", None)
scene.collection.objects.link(root)

# torso (hoodie) — chubby egg
sphere("Torso", "hoodie", (0, 0, 0.78), (0.56, 0.47, 0.5), parent=root)
# kangaroo pocket bulge
sphere("Pocket", "hoodie", (0, -0.36, 0.62), (0.36, 0.14, 0.17), parent=root)
# white tee hem peeking out
bpy.ops.mesh.primitive_torus_add(major_radius=0.4, minor_radius=0.045, location=(0, 0, 0.37))
o = bpy.context.object; o.scale = (1.0, 0.86, 0.7); put(shade(o, 1), "cream", "TeeHem", root)
# hood collar + hood bunched behind the neck
bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.1, location=(0, 0.02, 1.13))
o = bpy.context.object; o.scale = (1.15, 1.0, 0.8); put(shade(o, 1), "cream", "HoodCollar", root)
sphere("Hood", "cream", (0, 0.27, 1.12), (0.38, 0.2, 0.2), parent=root)
# drawstrings
for s in (-1, 1):
    limb(f"String{s}", "cream", (s * 0.09, -0.4, 1.04), (s * 0.11, -0.49, 0.82), 0.016, parent=root)
    sphere(f"StringTip{s}", "cream", (s * 0.11, -0.495, 0.8), (0.024, 0.024, 0.04), subdiv=0, parent=root)
# arms: shoulder -> elbow -> hand tucked in the pocket
for s in (-1, 1):
    tube(f"Arm{s}", "hoodie", [(s * 0.42, -0.02, 1.0), (s * 0.52, -0.14, 0.76), (s * 0.4, -0.34, 0.62), (s * 0.22, -0.42, 0.6)], 0.13, parent=root)

# ---------- legs ----------
for s in (-1, 1):
    limb(f"Leg{s}", "pants", (s * 0.21, -0.02, 0.42), (s * 0.22, -0.04, 0.17), 0.17, parent=root)
    box(f"CargoPocket{s}", "pants", (s * 0.38, -0.04, 0.3), (0.05, 0.16, 0.14), bevel=0.02, parent=root)
    box(f"CargoFlap{s}", "pants", (s * 0.4, -0.04, 0.37), (0.04, 0.17, 0.035), bevel=0.012, parent=root)
    # sneakers
    box(f"Shoe{s}", "shoe", (s * 0.22, -0.09, 0.09), (0.22, 0.38, 0.15), bevel=0.06, parent=root)
    box(f"ShoeSole{s}", "sole", (s * 0.22, -0.09, 0.02), (0.235, 0.4, 0.05), bevel=0.02, parent=root)
    box(f"ShoePanel{s}", "shoe_dark", (s * 0.22, 0.0, 0.12), (0.226, 0.12, 0.06), bevel=0.025, parent=root)
    box(f"ShoeToe{s}", "shoe_dark", (s * 0.22, -0.26, 0.1), (0.2, 0.06, 0.06), bevel=0.025, parent=root)

# ---------- backpack ----------
box("Backpack", "bag", (0, 0.5, 0.8), (0.62, 0.24, 0.62), bevel=0.11, parent=root)
box("BackpackPocket", "bag", (0, 0.64, 0.66), (0.42, 0.08, 0.26), bevel=0.06, parent=root)
box("BackpackZip", "zip", (0, 0.685, 0.79), (0.36, 0.01, 0.012), bevel=0.004, parent=root)
for s in (-1, 1):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.34, minor_radius=0.035, location=(s * 0.33, 0.12, 0.84), rotation=(0, math.radians(90), 0))
    o = bpy.context.object; o.scale = (1, 0.75, 1.05); put(shade(o, 1), "bag", f"Strap{s}", root)
# mini panda keychain
sphere("CharmHead", "fur_white", (0.36, 0.58, 0.55), (0.07, 0.065, 0.065), parent=root)
for s in (-1, 1):
    sphere(f"CharmEar{s}", "fur_black", (0.36 + s * 0.05, 0.58, 0.61), (0.025, 0.02, 0.025), subdiv=0, parent=root)
limb("CharmChain", "zip", (0.36, 0.58, 0.62), (0.33, 0.6, 0.72), 0.006, parent=root)

# ---------- head (rigged on HeadRig so the site can turn/nod it) ----------
head = bpy.data.objects.new("HeadRig", None)
scene.collection.objects.link(head)
head.location = (0, 0, 1.1)
head.parent = root
bpy.context.view_layer.update()

sphere("Head", "fur_white", (0, 0, 1.62), (0.66, 0.6, 0.56), seg=40, ring=20, parent=head)
for s in (-1, 1):
    sphere(f"Ear{s}", "fur_black", (s * 0.45, 0.08, 2.08), (0.18, 0.11, 0.17), parent=head)
    sphere(f"EyePatch{s}", "fur_black", (s * 0.24, -0.5, 1.64), (0.17, 0.08, 0.13), rot=(0, math.radians(s * -25), 0), parent=head)
sphere("Muzzle", "fur_white", (0, -0.55, 1.44), (0.21, 0.12, 0.14), parent=head)
sphere("Nose", "nose", (0, -0.665, 1.5), (0.065, 0.04, 0.042), parent=head)
# smile
curve = bpy.data.curves.new("SmileCurve", "CURVE")
curve.dimensions = "3D"
curve.bevel_depth = 0.008
sp = curve.splines.new("BEZIER")
sp.bezier_points.add(2)
pts = [(-0.08, -0.655, 1.415), (0, -0.67, 1.39), (0.08, -0.655, 1.415)]
for bp, p in zip(sp.bezier_points, pts):
    bp.co = p
    bp.handle_left_type = bp.handle_right_type = "AUTO"
smile = bpy.data.objects.new("Smile", curve)
scene.collection.objects.link(smile)
smile.data.materials.append(M["nose"])
smile.parent = head
smile.matrix_parent_inverse = head.matrix_world.inverted()
# sunglasses
for s in (-1, 1):
    box(f"Lens{s}", "lens", (s * 0.2, -0.6, 1.63), (0.31, 0.06, 0.22), rot=(math.radians(-6), 0, math.radians(s * 6)), bevel=0.085, parent=head)
    box(f"Temple{s}", "lens", (s * 0.4, -0.33, 1.69), (0.035, 0.55, 0.04), rot=(0, 0, math.radians(s * -14)), bevel=0.012, parent=head)
box("Bridge", "lens", (0, -0.625, 1.67), (0.1, 0.04, 0.035), bevel=0.012, parent=head)

# ---------- bake modifiers, export ----------
bpy.ops.object.select_all(action="DESELECT")
for o in scene.objects:
    if o.type == "CURVE":
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.convert(target="MESH")
        for poly in o.data.polygons:
            poly.use_smooth = True
        o.select_set(False)
for o in scene.objects:
    if o.type == "MESH":
        bpy.context.view_layer.objects.active = o
        for m in list(o.modifiers):
            bpy.ops.object.modifier_apply(modifier=m.name)

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True, export_draco_mesh_compression_enable=False)
print("exported", OUT, "objects:", len([o for o in scene.objects if o.type == "MESH"]))

if PREVIEW:
    cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
    scene.collection.objects.link(cam)
    cam.location = (2.6, -4.6, 1.6)
    cam.rotation_euler = (math.radians(84), 0, math.radians(30))
    cam.data.lens = 50
    scene.camera = cam
    for loc, e in (((3, -3, 4), 900), ((-3, -2, 2), 400), ((0, 3, 3), 600)):
        l = bpy.data.objects.new("L", bpy.data.lights.new("L", "AREA"))
        l.data.energy = e; l.data.size = 3
        l.location = loc
        l.rotation_euler = (Vector((0, 0, 1.0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(l)
    w = bpy.data.worlds.new("W"); scene.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.02, 0.022, 1)
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.render.resolution_x, scene.render.resolution_y = 640, 800
    scene.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)
    print("preview", PREVIEW)
