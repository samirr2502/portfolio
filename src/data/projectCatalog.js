import deployments from "../../resources/deploymentsList.json";
import codeProjects from "../../resources/projectList.json";
import tools from "../../resources/toolsList.json";

const TOOL_ALIASES = {
  aws: "aws",
  ec2: "aws-ec2",
  s3: "aws-s3",
  route53: "aws-route53",
  react: "react",
  python: "python",
  java: "java",
  typescript: "typescript",
  javascript: "javascript",
  nodejs: "nodejs",
  node: "nodejs",
  mysql: "mysql",
  sql: "mysql",
  postgres: "postgresql",
  postgresql: "postgresql",
  flask: "flask",
  mongodb: "mongodb",
  flutter: "flutter",
  firebase: "firebase",
  firestore: "firebase-firestore",
  fcm: "firebase-fcm",
  messaging: "firebase-messaging",
  auth: "firebase-auth",
  functions: "firebase-functions",
  function: "firebase-functions",
  storage: "firebase-storage",
  supabase: "supabase",
  linux: "linux",
  nginx: "nginx",
  pm2: "pm2",
  apple: "apple",
  testflight: "apple-testflight",
  appstore: "apple-app-store",
};

export const CATEGORY_FILTERS = [
  { id: "web-app", label: "Web", short: "Web", group: "surface" },
  { id: "ios-app", label: "iOS App", short: "iOS", group: "surface" },
  { id: "android-app", label: "Android", short: "Android", group: "surface" },
  { id: "game", label: "Games", short: "Games", group: "type" },
  { id: "tool", label: "Tools", short: "Tools", group: "type" },
  { id: "class", label: "Class", short: "Class", group: "type" },
];

export const CATEGORY_SURFACE = CATEGORY_FILTERS.filter((item) => item.group === "surface");
export const CATEGORY_TYPE = CATEGORY_FILTERS.filter((item) => item.group === "type");

export const PROJECT_GROUPS = [
  { id: "personal", label: "Personal" },
  { id: "work", label: "Work" },
  { id: "class", label: "Class" },
  { id: "collab", label: "Collab" },
];

function deriveProjectGroupFromLive(item) {
  if (item.group) return item.group;

  const id = String(item.id || "").toLowerCase();
  const org = String(item.org || "").toLowerCase();
  const name = String(item.name || "").toLowerCase();

  if (id.includes("tituah") || name.includes("tituah")) return "collab";
  if (
    org.includes("prometheus") ||
    id.includes("prometheus") ||
    id.includes("portal") ||
    name.includes("portal")
  ) {
    return "work";
  }
  if (org.includes("clearview") || id.includes("clearview")) return "work";
  if (
    id.includes("construmates") ||
    id.includes("interact") ||
    name.includes("construmates") ||
    name.includes("interact")
  ) {
    return "personal";
  }
  if (org === "personal") return "personal";
  return "personal";
}

function deriveProjectGroupFromCode(item) {
  if (item.group) return item.group;

  const name = String(item.name || "").toLowerCase();
  const category = String(item.category || "").toLowerCase();
  const className = String(item.class || "").toLowerCase();
  const tags = (item.tags || []).map((tag) => String(tag).toLowerCase());

  if (name.includes("dominican") || name.includes("spot the song")) return "personal";
  if (name.includes("box collab")) return "personal";

  if (
    className ||
    category.includes("class") ||
    category.includes("capstone") ||
    tags.some((tag) => tag.startsWith("cs-") || /^cs\d+/.test(tag))
  ) {
    return "class";
  }

  return "personal";
}

function projectInitials(name) {
  const parts = String(name || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function resolveImageUrl(imagePath) {
  if (!imagePath) return null;
  const cleanPath = String(imagePath).startsWith("/") ? String(imagePath).slice(1) : String(imagePath);
  return `${import.meta.env.BASE_URL}${cleanPath}`;
}

function buildMediaFromCode(item, categories) {
  const images = (item.images || []).map(resolveImageUrl).filter(Boolean);
  const isMobile = categories.includes("ios-app") || categories.includes("android-app");
  const isWeb = categories.includes("web-app") && !isMobile;

  return {
    desktop: isWeb ? images : [],
    tablet: [],
    phone: isMobile ? images : isWeb ? images.slice(0, 1) : images,
    video: null,
  };
}

function buildMediaFromLive(item) {
  const desktop = (item.imagesDesktop || []).map(resolveImageUrl).filter(Boolean);
  const phone = (item.imagesMobile || []).map(resolveImageUrl).filter(Boolean);

  return {
    desktop,
    tablet: [],
    phone,
    video: null,
  };
}

function isTituahProject(item = {}) {
  return /tituah/i.test(String(item.id || "")) || /tituah/i.test(String(item.name || ""));
}

function availableDevices(media, categories, item = {}) {
  const devices = [];
  const isMobile = categories.includes("ios-app") || categories.includes("android-app");

  if (media.desktop?.length) devices.push("desktop");
  if (media.tablet?.length) devices.push("tablet");
  if (media.phone?.length || isMobile) devices.push("phone");

  // Tituah is a landscape web game — offer both desktop and mobile previews.
  if (isTituahProject(item)) {
    if (!devices.includes("desktop")) devices.unshift("desktop");
    if (!devices.includes("phone")) devices.push("phone");
  }

  if (!devices.length) {
    if (categories.includes("web-app") && !isMobile) devices.push("desktop");
    else devices.push("phone");
  }

  return devices;
}

function phoneOrientationFor(item = {}) {
  return isTituahProject(item) ? "landscape" : "portrait";
}

function normalizeToolToken(raw) {
  const text = String(raw)
    .replace(/<[^>]*>/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, " ")
    .trim();

  if (!text || text === "json") return null;

  const tokens = text.split(/\s+/);
  for (const token of tokens) {
    if (TOOL_ALIASES[token]) return TOOL_ALIASES[token];
  }

  return TOOL_ALIASES[text] || null;
}

function uniqueList(list) {
  return [...new Set(list.filter(Boolean))];
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function deriveCategoriesFromCode(item) {
  const categories = new Set();
  const category = String(item.category || "").toLowerCase();
  const tags = (item.tags || []).map((tag) => String(tag).toLowerCase());
  const name = String(item.name || "").toLowerCase();
  const className = String(item.class || "").toLowerCase();

  if (category.includes("apple") || tags.includes("apple") || tags.includes("ios")) {
    categories.add("ios-app");
  }

  if (category.includes("android") || tags.includes("android")) {
    categories.add("android-app");
  }

  if (
    category.includes("web") ||
    tags.includes("webapp") ||
    tags.includes("webapi") ||
    tags.includes("websockets")
  ) {
    categories.add("web-app");
  }

  if (category.includes("game") || tags.includes("game") || name.includes("chess") || name.includes("casino")) {
    categories.add("game");
  }

  if (category.includes("tool") || tags.includes("tool") || name.includes("status")) {
    categories.add("tool");
  }

  if (
    className ||
    category.includes("class") ||
    tags.some((tag) => tag.startsWith("cs-")) ||
    /cs[-\s]?\d+/i.test(category)
  ) {
    categories.add("class");
  }

  const hasSurface =
    categories.has("web-app") || categories.has("ios-app") || categories.has("android-app");
  if (!hasSurface) {
    categories.add("web-app");
  }

  return [...categories];
}

function deriveCategoriesFromLive(item) {
  const categories = new Set(["web-app"]);
  const name = String(item.name || "").toLowerCase();
  const id = String(item.id || "").toLowerCase();

  if (id.includes("status") || name.includes("status")) {
    categories.add("tool");
  }

  if (id.includes("portal") || id.includes("leads") || name.includes("portal")) {
    categories.add("tool");
  }

  if (isTituahProject(item)) {
    categories.add("game");
  }

  return [...categories];
}

function derivePlatformToolsFromCode(item) {
  const tags = (item.tags || []).map((tag) => String(tag).toLowerCase());
  const category = String(item.category || "").toLowerCase();
  const extras = [];

  if (tags.includes("firestore") || tags.includes("firebase")) {
    extras.push("firebase", "firebase-firestore");
  }
  if (tags.includes("auth")) {
    extras.push("firebase", "firebase-auth");
  }
  if (tags.includes("functions") || tags.includes("function")) {
    extras.push("firebase", "firebase-functions");
  }
  if (tags.includes("storage")) {
    extras.push("firebase", "firebase-storage");
  }
  if (tags.includes("fcm") || tags.includes("messaging")) {
    extras.push("firebase", "firebase-fcm", "firebase-messaging");
  }
  if (tags.includes("supabase")) {
    extras.push("supabase", "supabase-auth", "supabase-storage", "supabase-db", "postgresql");
  }
  if (tags.includes("mongodb") || tags.includes("mongo")) {
    extras.push("mongodb", "mongodb-database");
  }
  if (
    category.includes("apple") ||
    tags.includes("apple") ||
    tags.includes("ios") ||
    tags.includes("testflight")
  ) {
    extras.push("apple", "apple-testflight");
  }
  if (tags.includes("app-store") || tags.includes("appstore") || tags.includes("app store")) {
    extras.push("apple", "apple-app-store");
  }

  return extras;
}

function flattenToolsCatalog(list = tools) {
  const flat = [];
  list.forEach((tool) => {
    flat.push(tool);
    (tool.children || []).forEach((child) => {
      flat.push({
        ...child,
        group: tool.group,
        parentId: tool.id,
        icon: child.icon || null,
      });
    });
  });
  return flat;
}

const flatTools = flattenToolsCatalog();

export function getToolById(id) {
  return flatTools.find((tool) => tool.id === id) || null;
}

export function getLanguageTools() {
  return tools.filter((tool) => tool.group === "language");
}

export function getPlatformTools() {
  return tools.filter((tool) => tool.group === "platform");
}

export function projectMatchesToolSelection(projectTools, selectedIds) {
  if (!selectedIds.length) return true;

  return selectedIds.every((selectedId) => {
    const selected = getToolById(selectedId) || tools.find((tool) => tool.id === selectedId);
    if (!selected) return projectTools.includes(selectedId);

    if (selected.children?.length) {
      return (
        projectTools.includes(selected.id) ||
        selected.children.some((child) => projectTools.includes(child.id))
      );
    }

    if (selected.parentId) {
      return projectTools.includes(selected.id);
    }

    return projectTools.includes(selected.id);
  });
}

function expandProjectTools(toolIds = []) {
  const expanded = uniqueList(toolIds);

  if (expanded.includes("mongodb") && !expanded.includes("mongodb-database")) {
    expanded.push("mongodb-database");
  }
  if (expanded.includes("mongodb-database") && !expanded.includes("mongodb")) {
    expanded.push("mongodb");
  }

  if (
    (expanded.includes("nginx") || expanded.includes("pm2")) &&
    !expanded.includes("linux")
  ) {
    expanded.push("linux");
  }

  if (
    expanded.includes("supabase") ||
    expanded.some((id) => typeof id === "string" && id.startsWith("supabase-"))
  ) {
    if (!expanded.includes("supabase")) expanded.push("supabase");
    if (!expanded.includes("postgresql")) expanded.push("postgresql");
  }

  if (
    expanded.includes("apple-testflight") ||
    expanded.includes("apple-app-store")
  ) {
    if (!expanded.includes("apple")) expanded.push("apple");
  }

  if (
    expanded.includes("firebase") ||
    expanded.some((id) => typeof id === "string" && id.startsWith("firebase-"))
  ) {
    if (!expanded.includes("firebase")) expanded.push("firebase");
  }

  return uniqueList(expanded);
}

export function buildProjectCatalog() {
  const live = deployments.map((item) => {
    const categories = deriveCategoriesFromLive(item);
    const media = buildMediaFromLive(item);
    const thumb = media.phone[0] || media.desktop[0] || null;
    return {
      id: `live-${item.id}`,
      name: item.name,
      kind: "live",
      org: item.org,
      description: item.description,
      url: item.url,
      github: null,
      status: item.status,
      env: item.env,
      featured: Boolean(item.featured),
      year: null,
      tools: expandProjectTools(item.tools || []),
      categories,
      group: deriveProjectGroupFromLive(item),
      initials: projectInitials(item.name),
      media,
      devices: availableDevices(media, categories, item),
      phoneOrientation: phoneOrientationFor(item),
      thumb,
    };
  });

  const code = codeProjects.map((item) => {
    const toolsFromLanguages = expandProjectTools([
      ...(item.languages || []).map(normalizeToolToken),
      ...derivePlatformToolsFromCode(item),
    ]);
    const categories = deriveCategoriesFromCode(item);
    const media = buildMediaFromCode(item, categories);
    const thumb = media.phone[0] || media.desktop[0] || null;
    return {
      id: `code-${slugify(item.name)}`,
      name: item.name,
      kind: "code",
      org: item.category || "Code",
      description:
        item.description ||
        `${item.name} codebase${item.class ? ` · ${item.class}` : ""}${item.year ? ` · ${item.year}` : ""}.`,
      url: item.webLink || null,
      github: item.githubRep || null,
      status: null,
      env: null,
      featured: Boolean(item.featured),
      year: item.year || null,
      tools: toolsFromLanguages,
      categories,
      group: deriveProjectGroupFromCode(item),
      initials: projectInitials(item.name),
      media,
      devices: availableDevices(media, categories, item),
      phoneOrientation: phoneOrientationFor(item),
      thumb,
    };
  });

  return [...live, ...code];
}

export function getToolsCatalog() {
  return tools;
}

export function filterProjects(
  projects,
  { kind = "all", toolIds = [], categoryIds = [] } = {}
) {
  const selectedTools = uniqueList(toolIds);
  const selectedCategories = uniqueList(categoryIds);
  const surfaceIds = selectedCategories.filter((id) =>
    CATEGORY_SURFACE.some((item) => item.id === id)
  );
  const typeIds = selectedCategories.filter((id) =>
    CATEGORY_TYPE.some((item) => item.id === id)
  );

  return projects.filter((project) => {
    const kindMatch = kind === "all" || project.kind === kind;
    const toolMatch = projectMatchesToolSelection(project.tools, selectedTools);
    const surfaceMatch =
      !surfaceIds.length || surfaceIds.every((id) => project.categories.includes(id));
    const typeMatch =
      !typeIds.length || typeIds.every((id) => project.categories.includes(id));
    return kindMatch && toolMatch && surfaceMatch && typeMatch;
  });
}

export const projectCatalog = buildProjectCatalog();
