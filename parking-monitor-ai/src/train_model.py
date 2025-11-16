import torch
from ultralytics import YOLO

def main():
    torch.cuda.empty_cache()
    torch.backends.cudnn.enabled = False
    torch.backends.cuda.matmul.allow_tf32 = False

    # ✅ usar modelo más estable aún
    model = YOLO("yolov8n.pt")

    # Entrenamiento muy seguro
    model.train(
        data="C:/Users/hpvictus/Downloads/parking-main/datasets/dataset/data.yaml",
        epochs=50,
        imgsz=416,        # 🔽 menos carga de VRAM
        batch=1,          # 🔽 solo 1 imagen a la vez
        device="cpu",
        amp=False,
        workers=0,
        deterministic=True,
        optimizer="SGD",  # ⚙️ evita NaN del AdamW
        lr0=0.001,        # 🔽 tasa de aprendizaje más baja
        project="runs/train",
        name="toycar_detector_finalsafe"
    )

if __name__ == "__main__":
    main()
