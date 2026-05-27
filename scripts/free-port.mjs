/**
 * Libera apenas a porta do app (padrão 3000), matando só o PID em LISTEN.
 * Não usa taskkill em node.exe — evita encerrar outros projetos Node.
 */
import { execSync } from "node:child_process";

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`PORT inválida: ${process.env.PORT}`);
  process.exit(1);
}

function killPids(pids) {
  if (pids.size === 0) {
    return;
  }

  for (const pid of pids) {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      } else {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      }
      console.log(`Porta ${port} liberada (PID ${pid}).`);
    } catch {
      console.warn(`Não foi possível encerrar PID ${pid} na porta ${port}.`);
    }
  }
}

function findListeningPidsWindows(targetPort) {
  const pids = new Set();
  const suffix = `:${targetPort}`;

  try {
    const output = execSync("netstat -ano -p tcp", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    for (const line of output.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) {
        continue;
      }
      const localAddress = line.trim().split(/\s+/)[1];
      if (!localAddress?.endsWith(suffix)) {
        continue;
      }
      const pid = line.trim().split(/\s+/).at(-1);
      if (pid && /^\d+$/.test(pid) && pid !== "0") {
        pids.add(pid);
      }
    }
  } catch {
    // Nenhum processo na porta ou netstat indisponível.
  }

  return pids;
}

function findListeningPidsUnix(targetPort) {
  const pids = new Set();

  try {
    const output = execSync(`lsof -tiTCP:${targetPort} -sTCP:LISTEN`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    for (const pid of output.trim().split(/\s+/)) {
      if (pid) {
        pids.add(pid);
      }
    }
  } catch {
    // Porta livre.
  }

  return pids;
}

const pids =
  process.platform === "win32"
    ? findListeningPidsWindows(port)
    : findListeningPidsUnix(port);

killPids(pids);
