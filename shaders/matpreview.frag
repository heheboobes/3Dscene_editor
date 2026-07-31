#version 330 core
in vec3 vNormal;
in vec3 vWorldPos;
in vec2 vUv;

uniform sampler2D uAlbedo;
uniform vec3 uLightDir;
uniform vec3 uCamPos;

out vec4 FragColor;

// Simple material-preview lighting: hemisphere ambient + key light + spec.
void main() {
    vec3 albedo = texture(uAlbedo, vUv).rgb;
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDir);
    float diff = max(dot(N, L), 0.0);
    vec3 V = normalize(uCamPos - vWorldPos);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 64.0) * 0.35;
    float hemi = 0.5 + 0.5 * N.y;
    vec3 ambient = mix(vec3(0.16, 0.18, 0.22), vec3(0.38, 0.42, 0.48), hemi);
    vec3 color = albedo * (ambient + diff * vec3(1.0, 0.98, 0.92) * 0.95) + spec;
    FragColor = vec4(color, 1.0);
}
