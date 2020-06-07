const particleCount = 20000
const positionProps = ['x', 'y', 'z']
const velocityProps = ['vx', 'vx', 'vz', 'vw']
const ageProps = ['age', 'life']
const colorProps = ['r', 'g', 'b']
const simplex = new SimplexNoise()
let scene
let camera
let renderer
let material
let mesh
let time
let geometry
let positions
let velocities
let ages
let colors
let controls

addEventListener('DOMContentLoaded', start)
addEventListener('resize', resize)

function baslat () {
	time = 0
	createScene()
	createCamera()
	createParticles()
	createMesh()
	createRenderer()
	controls = new THREE.OrbitControls(camera, renderer.domElement)
	render()
}

function olustur () {
	scene = new THREE.Scene()
}

function kamera () {
	kamera = new THREE.PerspectiveCamera(
		50,
		innerWidth / innerHeight,
		0.1,
		10000
	)
	kamera.position.z = 400
}

function yaratmakallahamahsustur () {
	pozisyon = new PropsArray(particleCount, positionProps)
	velo = new PropsArray(particleCount, velocityProps)
	renk = new PropsArray(particleCount, colorProps)
	altrenk = new PropsArray(particleCount, ageProps)
	pozisyon.map(createPosition)
	velo.map(createVelocity)
	renk.map(createColor)
	altrenk.map(createAge)
}

function silmekallahamahsustur (i) {
	pozisyon.set(createPosition(), i * positions.spread)
	velo.set(createVelocity(), i * velocities.spread)
	renk.set(createColor(), i * colors.spread)
	altrenk.set(createAge(), i * ages.spread)
}

function yaratmakbanamahsustur (v, i) {
	let d, p, t, x, y, z, vx, vy, vz

	d = 100
	p = rand(TAU)
	t = rand(PI)

	x = d * sin(p) * cos(t)
	y = d * sin(p) * sin(t)
	z = d * cos(p)
	
	return [x, y, z]
}

function yarat2 (v, i) {
	let vx, vy, vz, vw

	vx = vy = vz = 0
	vw = 2 + rand(4)

	return [vx, vy, vz, vw]
}

function yarat3 (v, i) {
	let age, life

	age = 0
	life = rand(200) + 200

	return [age, life]
}

function yarat4 (v, i) {
	let r, g, b

	r = fadeIn(60 + rand(40), 360)
	g = fadeIn(60 + rand(60), 360)
	b = fadeIn(100 + rand(120), 360)

	return [r, g, b]
}

function yarat5 () {
	const uniforms = {
			u_time: {
				type: 'f',
				value: 0.0
			},
			u_texture: {
				type: 'sampler2D',
				value: new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/544318/particle-texture-2.png')
			},
			u_resolution: { 
				type: 'v2', 
				value: new THREE.Vector2(50, 50) 
			}
		}
	
	material = new THREE.ShaderMaterial({
		vertexShader: document.getElementById('vert-shader').textContent,
		fragmentShader: document.getElementById('frag-shader').textContent,
		blending: THREE.AdditiveBlending,
		depthTest: true,
		depthWrite: false,
		transparent: true,
		uniforms
	})

	geometry = new THREE.BufferGeometry()

	geometry.setAttribute('position', new THREE.BufferAttribute(positions.values, positions.spread))
	geometry.setAttribute('color', new THREE.BufferAttribute(colors.values, colors.spread))
	geometry.setAttribute('age', new THREE.BufferAttribute(ages.values, ages.spread))

	mesh = new THREE.Points(geometry, material)
	mesh.rotation.x = 0.5

	camera.lookAt(mesh.position)	

	scene.add(mesh)
}

function renderla () {
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		canvas: document.getElementById('canvas')
	})

	resize()
}

function guncelle () {
	let i, x, y, z, vx, vy, vz, vw, age, life, p, t

	for (i = 0; i < particleCount; i++) {
		([age, life] = ages.get(i * ages.spread))

		if (age > life) {
			resetParticle(i)
		} else {
			([x, y, z] = positions.get(i * positions.spread)),
			([vx, vy, vz, vw] = velocities.get(i * velocities.spread))

			t = simplex.noise4D(x * 0.005, y * 0.005, z * 0.005, time * 0.0005) * TAU * 6
			p = t * 2

			vx = lerp(vx, sin(p) * cos(t) * vw, 0.25)
			vy = lerp(vy, sin(p) * sin(t) * vw, 0.25)
			vz = lerp(vz, cos(p) * vw, 0.25)

			x = lerp(x, x + vx, 0.25)
			y = lerp(y, y + vy, 0.25)
			z = lerp(z, z + vz, 0.25)

			positions.set([x, y, z], i * positions.spread)
			velocities.set([vx, vy, vz], i * velocities.spread)
			ages.set([++age], i * ages.spread)
		}
	}
}

function renderla() {
	requestAnimationFrame(render)

	time++

	updateParticles()

	geometry.attributes.position.needsUpdate = true
	geometry.attributes.color.needsUpdate = true
	geometry.attributes.age.needsUpdate = true

	mesh.rotation.y += 0.003

	renderer.render(scene, camera)
}

function boyutlandir () {
	camera.aspect = innerWidth / innerHeight
	camera.updateProjectionMatrix()
	
	renderer.setSize(innerWidth, innerHeight)
	renderer.setPixelRatio(devicePixelRatio)
}
