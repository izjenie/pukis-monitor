export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { spawn } = await import("child_process");
    const path = await import("path");
    
    const backendDir = path.join(process.cwd(), "backend");
    
    console.log("Starting FastAPI backend on port 8000...");
    
    const fastApiProcess = spawn(
      "python",
      ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
      {
        cwd: backendDir,
        stdio: "inherit",
        env: process.env,
      }
    );

    fastApiProcess.on("error", (err) => {
      console.error("Failed to start FastAPI:", err);
    });

    fastApiProcess.on("exit", (code) => {
      console.log(`FastAPI process exited with code ${code}`);
    });

    process.on("SIGTERM", () => {
      fastApiProcess.kill();
    });

    process.on("SIGINT", () => {
      fastApiProcess.kill();
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("FastAPI backend should be ready on http://localhost:8000");
  }
}
