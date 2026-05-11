(function () {
  const TERM_GROUPS = [
    {
      aliases: ["LLM", "LLM/VLM"],
      tip: "LLM：Large Language Model，大语言模型。通常指以 Transformer 为主体、通过海量文本训练出的生成式语言模型。"
    },
    {
      aliases: ["VLM", "VLM/VLA"],
      tip: "VLM：Vision-Language Model，视觉语言模型。输入通常包含图像和文本，输出回答、定位、结构化结果或工具调用。"
    },
    {
      aliases: ["VLA"],
      tip: "VLA：Vision-Language-Action，视觉-语言-动作模型。它把视觉观察和语言指令进一步接到动作输出。"
    },
    {
      aliases: ["RAG"],
      tip: "RAG：Retrieval-Augmented Generation，检索增强生成。先检索外部资料，再把资料交给模型生成答案。"
    },
    {
      aliases: ["MoE"],
      tip: "MoE：Mixture of Experts，专家混合模型。每个 token 通常只路由到部分 expert，以较低计算量扩大模型容量。"
    },
    {
      aliases: ["KV Cache", "KV cache", "KV"],
      tip: "KV Cache：Transformer 推理时缓存历史 token 的 Key/Value 张量。长上下文和高并发场景里，它经常是显存瓶颈。"
    },
    {
      aliases: ["LoRA"],
      tip: "LoRA：Low-Rank Adaptation，低秩适配。冻结主模型，只训练低秩增量参数来降低微调成本。"
    },
    {
      aliases: ["QLoRA"],
      tip: "QLoRA：在量化底座上训练 LoRA 增量的微调方法，常用于低显存大模型适配。"
    },
    {
      aliases: ["SFT"],
      tip: "SFT：Supervised Fine-Tuning，监督微调。用高质量指令或任务样本把底座模型塑造成更符合任务要求的行为。"
    },
    {
      aliases: ["RLHF"],
      tip: "RLHF：Reinforcement Learning from Human Feedback，基于人类反馈的强化学习对齐。"
    },
    {
      aliases: ["DPO"],
      tip: "DPO：Direct Preference Optimization，直接偏好优化。用偏好对直接优化模型策略，常用于后训练对齐。"
    },
    {
      aliases: ["PPO"],
      tip: "PPO：Proximal Policy Optimization，近端策略优化。RLHF 中常见的强化学习算法。"
    },
    {
      aliases: ["GRPO"],
      tip: "GRPO：Group Relative Policy Optimization，组相对策略优化。常用于推理模型后训练中的偏好或奖励优化。"
    },
    {
      aliases: ["MTP"],
      tip: "MTP：Multi-Token Prediction，多 token 预测。训练时让模型同时预测后续多个 token，可用于提升表示和推理效率。"
    },
    {
      aliases: ["acceptance rate", "Acceptance Rate", "acceptance", "Acceptance"],
      tip: "Acceptance Rate：投机解码中草稿 token 被目标模型接受的比例。接受越多，越可能提速；接受少时，验证开销可能吃掉收益。"
    },
    {
      aliases: ["loss", "Loss", "objective", "Objective"],
      tip: "Loss / Objective：训练目标函数。它把模型输出和期望结果之间的差距变成一个可优化的数值，决定模型朝哪个方向学习。"
    },
    {
      aliases: ["gradient", "Gradient", "Gradients"],
      tip: "Gradient：梯度，表示参数往哪个方向改能让 loss 下降。可以把它理解成训练里的“下坡方向”。"
    },
    {
      aliases: ["batch", "Batch", "batch size", "Batch Size"],
      tip: "Batch：一次送进模型的一组样本。Batch size 越大，统计更稳定但显存更高；越小，噪声更大但资源压力更低。"
    },
    {
      aliases: ["epoch", "Epoch", "step", "Step", "training step"],
      tip: "Step 是一次参数更新；Epoch 通常表示完整扫过训练集一遍。大模型常按 token 数和 step 管理训练，而不一定按 epoch。"
    },
    {
      aliases: ["learning rate", "Learning Rate", "LR schedule", "scheduler"],
      tip: "Learning Rate：学习率，控制每次参数更新迈多大步。太大容易发散，太小训练慢；schedule 决定它随训练进度如何变化。"
    },
    {
      aliases: ["warmup", "Warmup", "weight decay", "Weight Decay"],
      tip: "Warmup 让学习率从小逐渐升高，避免训练初期不稳定；Weight Decay 是对参数大小的约束，常用于减少过拟合。"
    },
    {
      aliases: ["overfitting", "Overfitting", "generalization", "Generalization"],
      tip: "Overfitting 是模型过度适配训练/验证数据而无法泛化；Generalization 指模型在未见过的数据上仍能表现稳定。"
    },
    {
      aliases: ["train set", "Train Set", "validation set", "Validation Set", "test set", "Test Set"],
      tip: "数据划分：Train 用来更新参数，Validation 用来调参和选 checkpoint，Test 用来做最终报告，三者混用会污染结论。"
    },
    {
      aliases: ["data leakage", "Data Leakage", "leakage", "污染", "数据污染"],
      tip: "Data Leakage / 数据污染：训练、调参或提示中意外包含了评测答案或近重复样本，会让离线分数虚高，不能代表真实泛化。"
    },
    {
      aliases: ["bucket", "Bucket", "bucketize", "Bucketize", "分桶"],
      tip: "Bucket / 分桶：把样本按长度、任务、风险、模态、shape 或失败类型分组看指标。它能暴露平均分掩盖的局部问题。"
    },
    {
      aliases: ["replay", "Replay", "回放", "replay set", "Replay Set"],
      tip: "Replay / 回放：用固定历史请求、轨迹或失败样本反复测试新模型或新系统，帮助判断改动是否真的修复问题并避免回归。"
    },
    {
      aliases: ["holdout", "Holdout", "holdout set", "Holdout Set"],
      tip: "Holdout：保留不用来训练和频繁调参的数据集。它用于更可信地检查模型是否泛化，而不是适配了开发过程。"
    },
    {
      aliases: ["checkpoint", "Checkpoint"],
      tip: "Checkpoint：训练或系统状态快照。好的 checkpoint 不只保存权重，还要能恢复 optimizer、随机数、并行状态和数据进度。"
    },
    {
      aliases: ["effective token", "Effective Token", "effective tokens", "Effective Tokens", "有效 token"],
      tip: "Effective Token：真正参与学习或有效计算的 token。扣掉 padding、mask 区域、坏样本和重复曝光后，它比名义 token 数更能说明训练价值。"
    },
    {
      aliases: ["data mixture", "Data Mixture", "mixture", "Mixture"],
      tip: "Data Mixture：训练时不同数据源的采样配比。它像模型的课程表，会直接影响能力结构、风格和长尾覆盖。"
    },
    {
      aliases: ["preflight", "Preflight"],
      tip: "Preflight：昂贵训练作业启动前的系统检查，通常覆盖节点健康、环境版本、数据状态、checkpoint、显存账本和配置一致性。"
    },
    {
      aliases: ["hyperparameter", "Hyperparameter", "seed", "Seed"],
      tip: "Hyperparameter 是训练前设定的配置，如学习率、batch size、权重衰减；Seed 是随机种子，用于控制实验可复现性。"
    },
    {
      aliases: ["logits", "Logits", "softmax", "Softmax", "Cross Entropy", "cross entropy"],
      tip: "Logits 是 softmax 前的未归一化分数；Softmax 把分数变成概率；Cross Entropy 常用于分类和 next-token 训练。"
    },
    {
      aliases: ["MSE", "L1", "MAE"],
      tip: "回归损失：MSE 强调大误差，L1/MAE 更关注绝对误差。选择哪种 loss 会影响模型对异常值的敏感度。"
    },
    {
      aliases: ["Forward", "forward", "Backward", "backward"],
      tip: "Forward 是前向计算预测和 loss；Backward 是反向传播梯度。训练显存高，主要因为 backward 需要保留或重算中间激活。"
    },
    {
      aliases: ["shape", "Shape", "dtype", "Dtype", "hidden size", "Hidden Size"],
      tip: "Shape 描述张量维度，dtype 描述数值格式，hidden size 描述表示向量宽度。三者共同决定接口、显存和计算成本。"
    },
    {
      aliases: ["latency", "Latency", "throughput", "Throughput", "memory bandwidth", "Memory Bandwidth"],
      tip: "系统性能术语：Latency 是单次请求耗时，Throughput 是单位时间处理量，Memory Bandwidth 是数据搬运速度。三者经常互相拉扯。"
    },
    {
      aliases: ["tail latency", "Tail Latency", "long-tail latency", "Long-tail Latency"],
      tip: "Tail Latency：尾延迟，关注最慢一小部分请求的耗时。线上体验常被 P95/P99 决定，而不是平均延迟。"
    },
    {
      aliases: ["head-of-line blocking", "Head-of-line blocking", "Head-of-Line Blocking", "HOL blocking"],
      tip: "Head-of-line Blocking：队首阻塞。前面的慢请求占住队列或资源，导致后面的快请求也被迫等待。"
    },
    {
      aliases: ["admission control", "Admission Control"],
      tip: "Admission Control：准入控制。系统在入口判断请求是否接收、排队、降级或拒绝，避免过载把所有请求一起拖垮。"
    },
    {
      aliases: ["DDPM"],
      tip: "DDPM：Denoising Diffusion Probabilistic Models，现代扩散模型的经典起点，核心是逐步加噪和逐步去噪。"
    },
    {
      aliases: ["DDIM"],
      tip: "DDIM：Denoising Diffusion Implicit Models。不重训模型，通过改变采样路径实现更少步的确定性或半确定性采样。"
    },
    {
      aliases: ["DPM-Solver++", "DPM-Solver", "DPM"],
      tip: "DPM-Solver：面向 diffusion ODE 的专用高阶求解器，目标是在较少采样步下保持生成质量。"
    },
    {
      aliases: ["Euler"],
      tip: "Euler：最简单的一阶数值积分方法。扩散采样里常作为快速、直接、好调试的低成本 solver。"
    },
    {
      aliases: ["Heun"],
      tip: "Heun：二阶预测-校正数值方法。扩散采样里常用额外一次模型调用换更平滑、更稳定的更新。"
    },
    {
      aliases: ["CFG"],
      tip: "CFG：Classifier-Free Guidance，无分类器引导。把条件和无条件预测组合起来，提高扩散生成对提示词的贴合度。"
    },
    {
      aliases: ["Classifier-Free Guidance"],
      tip: "Classifier-Free Guidance：无分类器引导。扩散模型中同时使用条件和无条件预测，通过线性外推增强提示词或条件控制。"
    },
    {
      aliases: ["ODE", "ODE/SDE", "SDE/ODE"],
      tip: "ODE：Ordinary Differential Equation，常微分方程。扩散里常指确定性的 probability flow 轨迹。"
    },
    {
      aliases: ["SDE"],
      tip: "SDE：Stochastic Differential Equation，随机微分方程。扩散里常指带随机噪声项的连续时间过程。"
    },
    {
      aliases: ["SNR"],
      tip: "SNR：Signal-to-Noise Ratio，信噪比。扩散训练里常用来描述信号与噪声在不同时间步的相对强度。"
    },
    {
      aliases: ["ELBO"],
      tip: "ELBO：Evidence Lower Bound，证据下界。变分推断常用目标，在扩散和潜变量模型里经常出现。"
    },
    {
      aliases: ["LCM"],
      tip: "LCM：Latent Consistency Models，潜空间一致性模型。目标是把扩散采样压到更少步。"
    },
    {
      aliases: ["DMD2", "DMD"],
      tip: "DMD：Distribution Matching Distillation，分布匹配蒸馏。DMD2 是其改进版本，常用于一步或少步扩散生成。"
    },
    {
      aliases: ["Distribution Matching Distillation"],
      tip: "Distribution Matching Distillation：分布匹配蒸馏。重点不是逐步模仿 teacher 轨迹，而是让学生模型的最终生成分布贴近目标分布。"
    },
    {
      aliases: ["Rectified Diffusion", "Rectified Flow", "rDM"],
      tip: "Rectified Diffusion：扩散快速生成中的路径整流路线。核心不是盲目追求几何上最直，而是让生成轨迹更适合少步或一步离散采样。rDM 在不同文献中可能有歧义，本文默认指 Rectified Diffusion/Flow 语境。"
    },
    {
      aliases: ["Score Matching"],
      tip: "Score Matching：学习数据分布 score 的训练思想。扩散模型里可理解为学习“从噪声样本往高概率数据区域走”的方向场。"
    },
    {
      aliases: ["noise schedule", "Noise Schedule", "beta schedule", "Beta Schedule"],
      tip: "Noise Schedule：扩散模型里每个时间步加多少噪声的规则。它会影响训练难度、采样稳定性和不同噪声阶段的学习重点。"
    },
    {
      aliases: ["epsilon prediction", "epsilon-prediction", "v-prediction", "velocity prediction"],
      tip: "扩散预测目标：epsilon prediction 预测噪声，v-prediction 预测速度变量。它们可以换算，但优化稳定性和 guidance 表现不同。"
    },
    {
      aliases: ["sampler", "Sampler"],
      tip: "Sampler：采样器。训练里常指如何抽取样本、数据源或长度桶；扩散推理里则指如何从噪声一步步走回数据。"
    },
    {
      aliases: ["sampling steps", "Sampling Steps"],
      tip: "Sampling Steps：扩散推理里的去噪步数。步数越少越快，但越难保住细节、多样性和条件贴合度。"
    },
    {
      aliases: ["Score SDE"],
      tip: "Score SDE：把扩散生成放进随机微分方程框架，用 score 网络描述连续时间的反向生成过程。"
    },
    {
      aliases: ["Probability Flow ODE", "Probability Flow"],
      tip: "Probability Flow ODE：与某个扩散 SDE 共享边缘分布的确定性 ODE 路径，是 DDIM 和许多高阶采样器的重要理论入口。"
    },
    {
      aliases: ["Consistency Models", "Consistency Model", "Consistency"],
      tip: "Consistency Models：一致性模型。目标是让同一生成轨迹上不同噪声时刻能直接映射到一致的干净结果，从而支持少步或一步生成。"
    },
    {
      aliases: ["Flow Matching"],
      tip: "Flow Matching：直接拟合从噪声分布到数据分布的连续速度场，常和 Rectified Flow、ODE 生成路线一起讨论。"
    },
    {
      aliases: ["Progressive Distillation"],
      tip: "Progressive Distillation：渐进式蒸馏。逐轮把 teacher 的多步采样压缩成更少步，让学生逐步学会快速生成。"
    },
    {
      aliases: ["teacher model", "Teacher Model", "student model", "Student Model"],
      tip: "Teacher / Student：蒸馏语境里的教师模型和学生模型。教师通常质量更高但更慢，学生学习教师行为以换取更低成本或更少步数。"
    },
    {
      aliases: ["Phased DMD"],
      tip: "Phased DMD：阶段化的 DMD 路线，把一步或少步生成拆成更稳的训练阶段，降低直接蒸馏的难度。"
    },
    {
      aliases: ["InstaFlow"],
      tip: "InstaFlow：基于 Rectified Flow 的一步文生图路线，代表了把扩散生成压缩到极少步的一类尝试。"
    },
    {
      aliases: ["EDM"],
      tip: "EDM：Elucidated Diffusion Models，系统梳理扩散噪声日程、参数化和采样设计空间的一类方法。"
    },
    {
      aliases: ["Latent Diffusion", "Stable Diffusion"],
      tip: "Latent Diffusion / Stable Diffusion：在压缩后的 latent 空间中做扩散生成，显著降低高分辨率图像生成成本。"
    },
    {
      aliases: ["ControlNet"],
      tip: "ControlNet：给扩散模型增加可控条件分支的方法，常用于边缘、深度、姿态、线稿等强结构控制。"
    },
    {
      aliases: ["UNet", "U-Net", "DiT"],
      tip: "扩散主干结构：UNet/U-Net 是经典卷积式去噪网络，DiT 是 Diffusion Transformer，用 Transformer 作为扩散去噪主干。"
    },
    {
      aliases: ["Transformer", "Attention", "Self-Attention", "Cross-Attention", "cross-attention"],
      tip: "Transformer / Attention：现代大模型核心结构。Self-Attention 建模同一序列内部关系，Cross-Attention 用于把文本、图像或其他条件注入主干。"
    },
    {
      aliases: ["QKV", "Q/K/V", "Query", "Key", "Value"],
      tip: "Q/K/V：Attention 的三组投影。Query 表示当前位置要找什么，Key 用于匹配，Value 是最终被加权读取的信息。"
    },
    {
      aliases: ["Embedding", "Tokenizer", "Latent"],
      tip: "基础表示术语：Tokenizer 把输入切成 token，Embedding 把离散 token 映射成向量，Latent 指模型内部更压缩的潜表示。"
    },
    {
      aliases: ["Tokenization", "Token", "Patch Token"],
      tip: "Tokenization：把文本、图像 patch、视频片段或动作切成模型能处理的 token 序列，是 Transformer 输入的第一步。"
    },
    {
      aliases: ["RoPE", "ALiBi", "Causal Mask", "Padding Mask", "Attention Mask"],
      tip: "位置与可见性术语：RoPE/ALiBi 用于注入位置信息，Causal/Padding/Attention Mask 决定哪些 token 能互相看见。"
    },
    {
      aliases: ["Conv", "Convolution", "CNN", "Receptive Field"],
      tip: "卷积/CNN 基础：Conv 用共享滑窗提取局部特征，Receptive Field 表示某个输出位置能看到的输入范围。"
    },
    {
      aliases: ["pixel", "Pixel", "patch", "Patch", "patchify", "Patchify"],
      tip: "视觉输入术语：Pixel 是图像最小网格点，Patch 是把图像切成的小块，Patchify 是把图像变成 patch token 序列。"
    },
    {
      aliases: ["stride", "Stride", "padding", "Padding", "channel", "Channel"],
      tip: "卷积形状术语：Stride 控制滑窗步长，Padding 控制边界补齐，Channel 表示特征通道数。"
    },
    {
      aliases: ["downsample", "Downsample", "upsample", "Upsample", "skip connection", "Skip Connection"],
      tip: "UNet/CNN 结构术语：Downsample 降低分辨率看全局，Upsample 恢复分辨率补细节，Skip Connection 把早期细节接回来。"
    },
    {
      aliases: ["Linear", "Linear Layer"],
      tip: "Linear Layer：线性层，通常做 xW+b 投影，是 QKV、输出投影和 MLP 中最常见的基础模块。"
    },
    {
      aliases: ["LayerNorm", "BatchNorm", "RMSNorm", "Residual", "SwiGLU", "GELU"],
      tip: "深层网络稳定组件：Norm 控制数值尺度，Residual 保留梯度通路，GELU/SwiGLU 等激活函数提供非线性表达。"
    },
    {
      aliases: ["Backprop", "Backpropagation", "Optimizer", "AdamW", "Gradient Clipping"],
      tip: "训练基础：Backprop 用链式法则计算梯度，Optimizer 根据梯度更新参数，Gradient Clipping 用于限制异常梯度。"
    },
    {
      aliases: ["Activation Checkpointing", "Checkpointing", "Autograd"],
      tip: "训练显存术语：Autograd 自动记录计算图并回传梯度；Activation Checkpointing 用反向重算换取更低激活显存。"
    },
    {
      aliases: ["PTQ"],
      tip: "PTQ：Post-Training Quantization，后训练量化。模型训练完成后再做量化，不重新大规模训练。"
    },
    {
      aliases: ["QAT"],
      tip: "QAT：Quantization-Aware Training，量化感知训练。训练时显式模拟量化误差，让模型提前适应低精度。"
    },
    {
      aliases: ["GPTQ"],
      tip: "GPTQ：一种后训练权重量化方法，用二阶近似和误差补偿降低低比特量化损失。"
    },
    {
      aliases: ["AWQ", "AutoAWQ"],
      tip: "AWQ：Activation-aware Weight Quantization。按激活敏感性保护关键权重或通道，常用于 LLM 低比特部署。"
    },
    {
      aliases: ["SmoothQuant"],
      tip: "SmoothQuant：通过重参数化把部分激活离群值迁移到权重侧，让激活量化更稳定。"
    },
    {
      aliases: ["FP32", "FP16", "BF16", "FP8", "FP4"],
      tip: "FP：Floating Point，浮点格式。FP32/FP16/BF16/FP8/FP4 表示不同位宽和数值范围的浮点精度。"
    },
    {
      aliases: ["MXFP8", "MXFP4", "MXFP", "MXINT", "Microscaling"],
      tip: "MXFP / Microscaling：微缩放低精度格式。通常让一小块元素共享 scale，再用 FP8/FP4 等低比特元素表示，兼顾局部分布和硬件效率。"
    },
    {
      aliases: ["NVFP4", "NVFP"],
      tip: "NVFP4：NVIDIA 低比特浮点格式路线，常结合更小微块、FP8 scale 和分层缩放来提升 FP4 训练或推理精度。"
    },
    {
      aliases: ["HiFloat8", "HIFP8", "HiF8"],
      tip: "HiFloat8 / HIFP8：面向深度学习的 8-bit 浮点格式路线，通过调整指数和尾数分配改善动态范围与精度折中。"
    },
    {
      aliases: ["INT8", "INT4", "W4A16", "W8A8", "W4A8", "NF4"],
      tip: "低比特量化格式：INT8/INT4 是整数低精度，W4A16 等描述权重和激活精度，NF4 常用于 QLoRA。"
    },
    {
      aliases: ["QDQ"],
      tip: "QDQ：QuantizeLinear / DequantizeLinear 表示。ONNX 图里常用它显式标注量化和反量化位置。"
    },
    {
      aliases: ["QOperator", "MatMulNBits"],
      tip: "ONNX 量化算子表示：QOperator 直接使用量化算子，MatMulNBits 常用于低比特权重矩阵乘路径。"
    },
    {
      aliases: ["ONNX Runtime", "ONNX", "ORT"],
      tip: "ONNX Runtime，常简称 ORT。它执行 ONNX 图，并通过不同 Execution Provider 对接 CPU、GPU 和厂商后端。"
    },
    {
      aliases: ["Execution Provider", "EP", "OpenVINO", "DirectML", "QNN"],
      tip: "ONNX Runtime 后端术语：Execution Provider 负责把 ONNX 图交给具体硬件或库执行，例如 OpenVINO、DirectML、QNN、TensorRT EP。"
    },
    {
      aliases: ["TensorRT-LLM", "TensorRT"],
      tip: "TensorRT-LLM：NVIDIA 面向大模型推理的高性能优化栈，常与 engine 构建、FP8、GPTQ/AWQ 和专用 kernel 绑定。"
    },
    {
      aliases: ["vLLM"],
      tip: "vLLM：常用 LLM serving runtime。它通过 PagedAttention、batching、KV cache 管理和量化格式支持提升在线吞吐。"
    },
    {
      aliases: ["SGLang"],
      tip: "SGLang：面向 LLM/VLM serving、结构化输出和 agent workload 的运行框架，也支持多种量化路径。"
    },
    {
      aliases: ["LightLLM"],
      tip: "LightLLM：偏轻量、高性能和易扩展的 LLM serving framework，常和特定 backend、kernel 与 ModelTC 生态工具结合。"
    },
    {
      aliases: ["GGUF"],
      tip: "GGUF：常见大模型本地推理权重格式，尤其常见于 llama.cpp 生态。"
    },
    {
      aliases: ["HQQ", "RTN"],
      tip: "低比特权重量化算法。RTN 通常指 round-to-nearest，HQQ 是一种半二次量化路线。"
    },
    {
      aliases: ["TorchAO"],
      tip: "TorchAO：PyTorch 生态中的量化和低精度工具集合，可用于实验和部分服务路径。"
    },
    {
      aliases: ["bitsandbytes"],
      tip: "bitsandbytes：常用于 Transformers 生态的 8bit/4bit 加载和低显存微调工具，研究和 QLoRA 场景很常见。"
    },
    {
      aliases: ["LLM Compressor", "LightCompress", "LLMC"],
      tip: "LLM 压缩工具链：常用于离线量化、剪枝、格式转换和导出到 vLLM、SGLang、LightLLM 等 runtime。"
    },
    {
      aliases: ["CPU", "GPU", "TPU", "NPU", "DSP"],
      tip: "硬件缩写：CPU 是通用处理器，GPU/TPU/NPU/DSP 常用于并行计算、AI 加速或边缘推理。"
    },
    {
      aliases: ["CUDA"],
      tip: "CUDA：NVIDIA GPU 编程平台和运行时，是很多深度学习 kernel、通信和推理优化的底层基础。"
    },
    {
      aliases: ["Triton"],
      tip: "Triton：面向 GPU 的高层 kernel 编程语言，常用于快速实现和自动调优深度学习算子。"
    },
    {
      aliases: ["GEMM"],
      tip: "GEMM：General Matrix-Matrix Multiplication，通用矩阵乘。Transformer 训练和推理中最核心的计算模式之一。"
    },
    {
      aliases: ["Kernel", "Fused Kernel", "KV Kernel"],
      tip: "Kernel：在 GPU/加速器上执行的底层计算程序。Fused Kernel 会把多个操作融合，减少中间读写和 launch 开销。"
    },
    {
      aliases: ["CUTLASS"],
      tip: "CUTLASS：NVIDIA 的 CUDA 矩阵乘和张量计算模板库，常用于构建高性能 GEMM kernel。"
    },
    {
      aliases: ["cuBLAS", "cuBLASLt", "cuDNN"],
      tip: "NVIDIA 高性能库：cuBLAS/cuBLASLt 主要提供矩阵乘能力，cuDNN 主要服务深度学习常用算子。"
    },
    {
      aliases: ["CuTe"],
      tip: "CuTe：CUTLASS 生态里的张量布局和算法组合抽象，常用于写更复杂的 GPU kernel。"
    },
    {
      aliases: ["FlashAttention"],
      tip: "FlashAttention：通过重排 attention 计算和内存访问，减少 HBM 读写，从而提升长序列注意力效率。"
    },
    {
      aliases: ["PagedAttention"],
      tip: "PagedAttention：把 KV cache 像分页内存一样管理，降低碎片并提升 LLM serving 的并发能力。"
    },
    {
      aliases: ["HBM", "L2", "SM", "Tensor Core", "Tensor Cores"],
      tip: "GPU 硬件术语：HBM 是高带宽显存，L2 是片上缓存，SM 是流式多处理器，Tensor Core 是矩阵计算单元。"
    },
    {
      aliases: ["NCCL", "NVLink"],
      tip: "NVIDIA 多卡通信相关术语。NCCL 是通信库，NVLink 是 GPU 间高速互联。"
    },
    {
      aliases: ["NVSwitch", "Hopper", "Blackwell", "SM90", "SM100"],
      tip: "NVIDIA 硬件与互联术语：Hopper/Blackwell 是 GPU 架构，SM90/SM100 是对应代际 SM，NVSwitch 用于多 GPU 高带宽互联。"
    },
    {
      aliases: ["PTX", "SASS"],
      tip: "GPU 编译结果层级：PTX 类似中间汇编，SASS 是更接近 NVIDIA GPU 机器指令的最终汇编。"
    },
    {
      aliases: ["TMA", "MMA", "WGMMA", "SIMT"],
      tip: "GPU kernel 术语：TMA 管张量内存搬运，MMA/WGMMA 管矩阵乘指令，SIMT 描述 GPU 的线程执行模型。"
    },
    {
      aliases: ["JIT"],
      tip: "JIT：Just-In-Time，即时编译。运行时根据实际形状或硬件生成优化后的代码。"
    },
    {
      aliases: ["compile cache", "Compile Cache", "compilation cache", "Compilation Cache", "cache hit", "Cache Hit", "cache miss", "Cache Miss"],
      tip: "编译缓存：把按 shape 或硬件生成的 kernel 版本保存起来。Cache hit 表示复用成功，cache miss 可能带来冷启动延迟和线上抖动。"
    },
    {
      aliases: ["CUDA Graph", "Inductor", "XLA", "TVM", "MLIR"],
      tip: "编译与执行优化术语：CUDA Graph 减少 launch 开销，Inductor/XLA/TVM/MLIR 属于图编译或中间表示生态。"
    },
    {
      aliases: ["Roofline", "Profiling", "Nsight Compute"],
      tip: "性能分析术语：Roofline 用计算强度和硬件上限定位瓶颈，Profiling/Nsight Compute 用于观察 kernel 的真实执行表现。"
    },
    {
      aliases: ["RMSNorm", "LayerNorm", "Softmax", "MLP", "Reduction", "Reduce"],
      tip: "常见神经网络算子：Norm 稳定激活尺度，Softmax 做概率归一化，MLP 是前馈层，Reduction/Reduce 做聚合计算。"
    },
    {
      aliases: ["MQA", "GQA", "MQA/GQA"],
      tip: "Attention 变体：MQA/GQA 通过共享或分组 Key/Value 头减少 KV cache 和带宽压力，常用于高效推理。"
    },
    {
      aliases: ["FLOPs"],
      tip: "FLOPs：浮点运算次数。常用于估算模型计算量，但实际速度还受内存带宽、kernel 和调度影响。"
    },
    {
      aliases: ["TTFT"],
      tip: "TTFT：Time To First Token，首 token 延迟。在线生成系统里衡量用户等待起始响应的关键指标。"
    },
    {
      aliases: ["TPOT"],
      tip: "TPOT：Time Per Output Token，每个输出 token 的平均生成时间，常用于衡量 decode 阶段速度。"
    },
    {
      aliases: ["QPS"],
      tip: "QPS：Queries Per Second，每秒请求数。衡量服务吞吐，但需要和延迟、质量一起看。"
    },
    {
      aliases: ["SLO", "SLA", "SLI"],
      tip: "服务可靠性术语：SLI 是指标，SLO 是目标，SLA 是对外承诺。推理服务常用它们约束延迟和可用性。"
    },
    {
      aliases: ["observability", "Observability", "trace", "Trace", "dashboard", "Dashboard"],
      tip: "Observability：可观测性。通过日志、指标、trace 和 dashboard 回答线上系统发生了什么、哪里慢、哪里错。"
    },
    {
      aliases: ["fallback", "Fallback", "rollback", "Rollback", "回退"],
      tip: "Fallback / Rollback：当新路径质量、延迟或稳定性不达标时切回保守路径。成熟部署必须提前设计回退边界。"
    },
    {
      aliases: ["P50", "P95", "P99", "P95/P99"],
      tip: "延迟分位数。P99 表示 99% 请求不超过该延迟，常用来观察尾延迟。"
    },
    {
      aliases: ["OOM"],
      tip: "OOM：Out Of Memory，内存或显存不足。大模型训练和推理中常见。"
    },
    {
      aliases: ["Prefill", "Decode", "Continuous Batching"],
      tip: "LLM 推理阶段术语：Prefill 处理输入上下文，Decode 逐 token 生成输出，Continuous Batching 允许请求动态进出批次。"
    },
    {
      aliases: ["Prefix Cache", "Speculative Decoding"],
      tip: "推理加速术语：Prefix Cache 复用重复前缀的 prefill 结果，Speculative Decoding 用草稿模型提案、主模型验证来提速。"
    },
    {
      aliases: ["EAGLE", "EAGLE-2", "EAGLE-3"],
      tip: "EAGLE：一类投机解码加速方法。核心是用更便宜的特征级或草稿路径提出候选 token，再由目标模型验证。"
    },
    {
      aliases: ["QSpec"],
      tip: "QSpec：把量化和投机解码结合的路线，常用低精度路径生成 draft，再用更高精度路径验证。"
    },
    {
      aliases: ["LayerSkip", "Logit Lens", "Early Exit"],
      tip: "LayerSkip / Logit Lens / Early Exit：利用中间层已经具备预测信息这一现象，让浅层或中间层提前输出或充当自投机 draft。"
    },
    {
      aliases: ["Agent", "ReAct", "Toolformer", "Function Calling"],
      tip: "Agent 与工具调用术语：ReAct 交替推理和行动，Toolformer 学习工具使用，Function Calling 让模型输出结构化工具调用。"
    },
    {
      aliases: ["DP", "TP", "PP", "CP", "SP"],
      tip: "并行策略缩写：DP 数据并行，TP 张量并行，PP 流水并行，CP 上下文并行，SP 序列并行。"
    },
    {
      aliases: ["Sequence Parallelism", "sequence parallelism"],
      tip: "Sequence Parallelism：沿序列维度把 token 或时间步切到多张卡上，适合长序列，但 attention 和状态同步会带来跨卡通信压力。"
    },
    {
      aliases: ["BPTT", "Truncated BPTT", "truncated BPTT"],
      tip: "BPTT：Backpropagation Through Time，时序反向传播。Truncated BPTT 会按时间段截断梯度，用更低显存换取近似的长序列训练。"
    },
    {
      aliases: ["Mixed Precision", "mixed precision"],
      tip: "Mixed Precision：混合精度训练或推理。常把不同张量放在 FP32、BF16、FP16、FP8 等不同精度中，以平衡速度、显存和稳定性。"
    },
    {
      aliases: ["FSDP", "ZeRO"],
      tip: "分布式训练显存优化方法。FSDP 和 ZeRO 都会切分参数、梯度或优化器状态来降低单卡压力。"
    },
    {
      aliases: ["MFU"],
      tip: "MFU：Model FLOPs Utilization，模型计算利用率。它衡量实际训练吞吐相对理论模型 FLOPs 的利用程度，比单看 GPU utilization 更贴近训练效率。"
    },
    {
      aliases: ["Megatron-LM", "Megatron Core", "Megatron", "DeepSpeed"],
      tip: "大模型训练系统：Megatron-LM/Core 常用于张量/流水/上下文并行，DeepSpeed 以 ZeRO、offload 和 pipeline runtime 闻名。"
    },
    {
      aliases: ["Checkpoint", "DataLoader", "Packing"],
      tip: "训练工程术语：Checkpoint 保存可恢复状态，DataLoader 负责输入管线，Packing 把短样本拼接以提升 token 利用率。"
    },
    {
      aliases: ["Gradient Checkpointing", "Offload", "Pipeline"],
      tip: "训练系统术语：Gradient Checkpointing 用重算换显存，Offload 把状态搬到 CPU/NVMe，Pipeline 把模型阶段化并行执行。"
    },
    {
      aliases: ["Scaling Law", "Curriculum Learning", "Judge Model"],
      tip: "训练方法术语：Scaling Law 描述规模与性能关系，Curriculum Learning 控制训练难度节奏，Judge Model 用于自动评估或偏好打分。"
    },
    {
      aliases: ["Adam", "AdamW", "EMA", "RNG", "LR"],
      tip: "训练优化术语：Adam/AdamW 是常用优化器，EMA 是指数滑动平均，RNG 是随机数状态，LR 是学习率。"
    },
    {
      aliases: ["CLIP"],
      tip: "CLIP：Contrastive Language-Image Pre-training，图文对比预训练模型，是多模态对齐和检索的经典基础。"
    },
    {
      aliases: ["BLIP-2", "Q-Former", "Flamingo", "LLaVA"],
      tip: "常见 VLM 路线：BLIP-2 用 Q-Former 连接视觉编码器和 LLM；Flamingo 强调交错图文上下文；LLaVA 代表视觉指令微调路线。"
    },
    {
      aliases: ["Qwen-VL", "Qwen2-VL", "InternVL", "Kosmos-2", "SeeClick"],
      tip: "常见 VLM/grounding 模型：Qwen-VL/InternVL 偏通用多模态能力，Kosmos-2/SeeClick 更强调把语言定位到图像区域或屏幕元素。"
    },
    {
      aliases: ["Pix2Struct", "LayoutLMv3"],
      tip: "文档/截图 VLM 模型：Pix2Struct 强调截图解析和可变分辨率输入，LayoutLMv3 强调文本、图像和二维布局联合建模。"
    },
    {
      aliases: ["OCR"],
      tip: "OCR：Optical Character Recognition，光学字符识别。用于从图片、截图或文档中读取文字。"
    },
    {
      aliases: ["evidence grounding", "Evidence Grounding", "field grounding", "Field Grounding", "field binding", "Field Binding"],
      tip: "Evidence / Field Grounding：把答案或字段绑定到具体页码、区域框和原文证据。文档系统里，它决定结果是否可审计、可复核。"
    },
    {
      aliases: ["VQA"],
      tip: "VQA：Visual Question Answering，视觉问答。模型根据图像内容回答问题。"
    },
    {
      aliases: ["Grounding", "Referring", "Screen Agent", "Document Understanding"],
      tip: "VLM 任务术语：Grounding/Referring 关注语言到图像区域的定位，Screen Agent 面向屏幕操作，Document Understanding 处理文档结构与文字。"
    },
    {
      aliases: ["PaLM-E", "SayCan", "RT-1", "RT-2", "RT-X", "OpenVLA"],
      tip: "常见 VLA 模型：PaLM-E 强调 embodied multimodal reasoning，SayCan 用 affordance 约束技能选择，RT-1/RT-2/RT-X/OpenVLA 学习从视觉语言到动作。"
    },
    {
      aliases: ["Diffusion Policy", "ACT", "ALOHA", "action chunk", "Action Chunk"],
      tip: "机器人动作策略术语：Diffusion Policy 用去噪生成动作序列；ACT/ALOHA 强调 action chunking 和遥操作示范，适合精细双臂操作。"
    },
    {
      aliases: ["IoU", "CER", "edit distance", "Edit Distance"],
      tip: "视觉/文档评测术语：IoU 衡量预测框和真实框重叠，CER 是字符错误率，edit distance 衡量字符串修改距离。"
    },
    {
      aliases: ["Retrieval", "Reranking", "Reranker", "Vector Database"],
      tip: "检索系统术语：Retrieval 召回候选，Reranking 重排候选，Vector Database 存储和查询向量表示。"
    },
    {
      aliases: ["InfoNCE"],
      tip: "InfoNCE：对比学习常用目标函数，要求模型在候选集合中把正确匹配项排到更前。"
    },
    {
      aliases: ["hard negative", "Hard Negative", "false negative", "False Negative", "augmentation", "Augmentation"],
      tip: "对比学习采样术语：Hard negative 是难但确实不同的负样本，false negative 是本该靠近却被误当负样本，augmentation 是构造不同视图的数据变换。"
    },
    {
      aliases: ["collapse", "Collapse", "representation collapse", "Representation Collapse"],
      tip: "Representation collapse：表征塌缩。模型把大量不同输入映射成几乎相同的向量，导致表示失去区分能力。"
    },
    {
      aliases: ["Alignment", "Uniformity", "alignment", "uniformity"],
      tip: "对比学习几何指标：Alignment 看正样本是否靠近，Uniformity 看整体表示是否均匀铺开。两者要平衡。"
    },
    {
      aliases: ["BYOL", "MoCo", "SimCLR"],
      tip: "自监督表征学习方法。BYOL 不显式依赖负样本，MoCo 使用动量编码器和队列，SimCLR 强调大 batch 和增强。"
    },
    {
      aliases: ["BM25", "ANN", "MRR", "F1", "FID"],
      tip: "评测或检索术语：BM25 是稀疏检索方法，ANN 是近似最近邻，MRR/F1/FID 是常见指标。"
    },
    {
      aliases: ["FVD", "VBench", "PSNR", "SSIM", "LPIPS", "next-frame prediction loss", "next-frame loss"],
      tip: "视频与世界模型评测术语：这些指标常衡量重建、下一帧预测或视觉质量，但不直接等价于规划、控制或闭环任务收益。"
    },
    {
      aliases: ["Benchmark", "Ablation", "Ablation Study"],
      tip: "实验评测术语：Benchmark 是基准测试，Ablation/Ablation Study 是消融实验，用来判断某个组件或设计是否真的带来收益。"
    },
    {
      aliases: ["Calibration", "Calibration Data", "Hessian", "Outlier", "Activation"],
      tip: "量化与训练分析术语：Calibration 用代表性数据估计量化参数，Hessian 描述二阶敏感性，Outlier 是异常大值，Activation 是中间层输出。"
    },
    {
      aliases: ["dequant", "Dequant", "dequantization", "Dequantization", "requant", "Requant"],
      tip: "Dequantization / Requant：反量化是把低比特值还原到计算格式，requant 是再压回低比特。频繁转换会吃掉量化收益。"
    },
    {
      aliases: ["layout", "Layout", "memory layout", "Memory Layout", "weight packing", "Weight Packing"],
      tip: "Layout：排布方式，含义要看语境。文档/VLM 中常指页面二维布局；算子系统中常指张量内存排布和 weight packing，会影响访存与 kernel 效率。"
    },
    {
      aliases: ["microbenchmark", "Microbenchmark", "micro-benchmark", "Micro-benchmark"],
      tip: "Microbenchmark：只测单个 kernel 或小路径的基准。它能定位局部性能，但不能直接代表端到端服务或训练 step。"
    },
    {
      aliases: ["Dispatch", "Shape Bucket", "shape family", "Shape Family", "Workload"],
      tip: "服务与 kernel 调度术语：Dispatch 决定请求或算子走哪条实现路径，Shape Bucket 把相近形状归桶，Workload 指实际负载分布。"
    },
    {
      aliases: ["all-to-all", "All-to-All", "A2A"],
      tip: "All-to-All：每个设备都和其他设备交换数据的通信模式。MoE expert dispatch 和专家并行中很常见，网络拓扑不好时会成为瓶颈。"
    },
    {
      aliases: ["capacity factor", "Capacity Factor"],
      tip: "Capacity Factor：MoE 中给每个 expert 预留多少 token 容量的系数。太小容易 overflow/drop，太大又会浪费计算和显存。"
    },
    {
      aliases: ["RSSM", "PlaNet"],
      tip: "RSSM：Recurrent State-Space Model，循环状态空间模型。PlaNet 和 Dreamer 等世界模型常用它从像素学习可 rollout 的潜动态。"
    },
    {
      aliases: ["World Model", "World Models", "Dreamer", "DreamerV2", "DreamerV3", "Imagined Rollout", "Rollout"],
      tip: "世界模型术语：World Model 学习环境动态，Dreamer 系列在潜空间 imagined rollout 中学习策略，Rollout 指向未来展开轨迹。"
    },
    {
      aliases: ["open-loop", "Open-loop", "closed-loop", "Closed-loop"],
      tip: "Open-loop 指离线或不把输出反馈回系统的评测；Closed-loop 指模型输出会影响下一步输入的闭环评测，更接近真实决策和控制。"
    },
    {
      aliases: ["WM", "WAM", "VAM", "Genie", "LingBot-World", "DreamZero"],
      tip: "世界模型谱系：WM 是 World Model，WAM/VAM 强调动作与视觉未来联合建模；Genie、LingBot-World、DreamZero 代表较新的交互式或 world-action 路线。"
    },
    {
      aliases: ["JEPA", "V-JEPA", "latent prediction", "Latent Prediction"],
      tip: "JEPA / V-JEPA：在 latent 表征空间预测被遮挡或未来内容，目标是学习对理解和规划有用的内部世界表征，而不是逐像素生成。"
    },
    {
      aliases: ["MPC"],
      tip: "MPC：Model Predictive Control，模型预测控制。不断用模型预测未来，再滚动选择当前动作。"
    },
    {
      aliases: ["behavior prior", "Behavior Prior", "behaviour prior", "Behaviour Prior"],
      tip: "Behavior Prior：行为先验。它偏向数据中常见、自然、可执行的动作轨迹，避免 planner 选择模型漏洞里的奇怪高分动作。"
    },
    {
      aliases: ["counterfactual", "Counterfactual", "near-miss", "Near-miss"],
      tip: "Counterfactual / Near-miss：反事实关注“如果换个条件会怎样”，near-miss 是接近失败但未造成事故的样本，常用于风险和恢复训练。"
    },
    {
      aliases: ["Planning", "Affordance", "Teleoperation"],
      tip: "具身智能术语：Planning 负责规划动作序列，Affordance 表示环境中可执行动作机会，Teleoperation 是人工遥操作采集示范。"
    },
    {
      aliases: ["Domain Randomization", "System ID", "Safety Case", "safety case"],
      tip: "具身部署术语：Domain Randomization 让仿真随机化以提高鲁棒性，System ID 校准真实物理参数，Safety Case 是安全论证证据链。"
    },
    {
      aliases: ["policy", "Policy", "reward", "Reward", "trajectory", "Trajectory"],
      tip: "控制与强化学习术语：Policy 是从状态到动作的策略，Reward 是反馈信号，Trajectory 是一段观测、动作和结果组成的轨迹。"
    },
    {
      aliases: ["state", "State", "action", "Action", "controller", "Controller"],
      tip: "控制系统基础：State 描述当前系统状态，Action 是要执行的动作，Controller 把目标或计划转成可执行控制量。"
    },
    {
      aliases: ["PID"],
      tip: "PID：比例、积分、微分控制器。经典低层控制方法，常作为机器人执行层基础。"
    },
    {
      aliases: ["Sim2Real"],
      tip: "Sim2Real：Simulation-to-Reality，仿真到现实迁移。关注策略从模拟环境落到真实世界时的分布差异。"
    },
    {
      aliases: ["RL", "BC", "IL", "MDP", "POMDP"],
      tip: "控制与强化学习术语：RL 是强化学习，BC 是行为克隆，IL 是模仿学习，MDP/POMDP 是决策过程建模。"
    },
    {
      aliases: ["DQN", "Q-learning", "Q Learning"],
      tip: "DQN / Q-learning：学习状态-动作价值 Q(s,a)，再选择长期价值更高的动作。DQN 用深度网络近似 Q 函数。"
    },
    {
      aliases: ["TD target", "TD Target", "bootstrapping", "Bootstrapping"],
      tip: "TD target：用当前奖励加下一状态估计价值构造训练目标；bootstrapping 指用模型自己的未来估计训练当前估计。"
    },
    {
      aliases: ["replay buffer", "Replay Buffer", "experience replay", "Experience Replay"],
      tip: "Replay Buffer / Experience Replay：保存历史交互样本，训练时随机抽取复用，能降低样本相关性并提高样本效率。"
    },
    {
      aliases: ["target network", "Target Network"],
      tip: "Target Network：用于计算稳定目标值的慢更新网络。它让 value target 不会随着当前网络每步剧烈漂移。"
    },
    {
      aliases: ["on-policy", "On-policy", "off-policy", "Off-policy", "offline RL", "Offline RL"],
      tip: "On-policy 用当前策略刚采的数据更新；off-policy 会复用历史策略数据；offline RL 只用固定数据集，不再和环境交互。"
    },
    {
      aliases: ["SAC", "A3C", "entropy regularization", "Entropy Regularization"],
      tip: "SAC 是最大熵 actor-critic 方法，强调探索和稳定性；A3C 用异步并行 actor 收集经验；entropy regularization 鼓励策略不要过早变确定。"
    },
    {
      aliases: ["behavior policy", "Behavior Policy"],
      tip: "Behavior Policy：负责产生训练数据的策略。Offline RL 中它可能是旧模型、人类示范或混合系统，通常和正在优化的 target policy 不同。"
    },
    {
      aliases: ["reward hacking", "Reward Hacking"],
      tip: "Reward Hacking：策略利用奖励函数漏洞拿高分，但真实任务没有变好。RLHF、机器人和世界模型训练都需要专门防范。"
    },
    {
      aliases: ["RLVR"],
      tip: "RLVR：Reinforcement Learning with Verifiable Rewards，用规则、测试、指标等可验证奖励训练模型，常见于数学、代码和世界模型状态预测。"
    },
    {
      aliases: ["Actor-Critic", "actor-critic", "critic", "Critic", "actor", "Actor"],
      tip: "Actor-Critic：actor 负责生成动作或 token，critic 估计未来回报作为 baseline，帮助降低策略梯度方差。"
    },
    {
      aliases: ["value", "Value", "value function", "Value Function", "Q-value", "Q Value"],
      tip: "Value / Q-value：估计从当前状态或状态-动作对出发的未来回报。它不是当前 reward，而是长期收益预期。"
    },
    {
      aliases: ["advantage", "Advantage", "GAE"],
      tip: "Advantage：某个动作相对当前平均预期有多好；GAE 是 actor-critic/PPO 中常用的低方差 advantage 估计方法。"
    },
    {
      aliases: ["return", "Return", "Bellman", "Bellman Equation"],
      tip: "Return 是未来折扣奖励总和；Bellman Equation 把当前价值递推为当前奖励加下一状态价值，是 RL 和 world model planning 的基础。"
    },
    {
      aliases: ["HybridFlow", "verl"],
      tip: "verl 是大模型强化学习训练库，来自 HybridFlow 思路；它把 RL 控制流和 actor/rollout/critic/reward 等分布式模型计算拆开。"
    },
    {
      aliases: ["OOD", "ODD"],
      tip: "风险边界术语：OOD 指分布外样本，ODD 指 Operational Design Domain，即系统被设计允许工作的运行域。"
    },
    {
      aliases: ["SLAM", "ROS", "ROS2"],
      tip: "机器人系统术语：SLAM 是同步定位与建图，ROS/ROS2 是常用机器人软件框架。"
    },
    {
      aliases: ["API", "JSON", "DOM"],
      tip: "工程接口术语：API 是程序接口，JSON 是常用数据交换格式，DOM 是浏览器页面结构树。"
    }
  ];

  const SKIP_SELECTOR = [
    "a",
    "abbr",
    "code",
    "pre",
    "kbd",
    "samp",
    "script",
    "style",
    "textarea",
    "h1",
    "h2",
    "h3",
    ".arithmatex",
    ".MathJax",
    ".highlight",
    ".term-tip",
    ".md-nav",
    ".md-search"
  ].join(",");

  const termTips = new Map();
  let tooltipElement = null;
  let activeTerm = null;
  let floatingTooltipsReady = false;
  const MAX_AUTO_DECORATIONS_PER_TIP = 4;

  for (const group of TERM_GROUPS) {
    for (const alias of group.aliases) {
      termTips.set(alias, group.tip);
    }
  }

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const aliases = Array.from(termTips.keys()).sort((a, b) => b.length - a.length);
  const pattern = new RegExp("(^|[^A-Za-z0-9_])(" + aliases.map(escapeRegex).join("|") + ")(?![A-Za-z0-9_])", "g");

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    return !parent || parent.closest(SKIP_SELECTOR);
  }

  function makeTermElement(text, tip) {
    const span = document.createElement("span");
    span.className = "term-tip term-auto";
    span.dataset.tip = tip;
    span.textContent = text;
    span.tabIndex = 0;
    span.setAttribute("role", "term");
    span.setAttribute("aria-label", text + "：" + tip);
    return span;
  }

  function getTooltipElement() {
    if (tooltipElement) {
      return tooltipElement;
    }

    tooltipElement = document.createElement("div");
    tooltipElement.className = "term-tooltip-popover";
    tooltipElement.setAttribute("role", "tooltip");
    tooltipElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(tooltipElement);
    return tooltipElement;
  }

  function positionTooltip(term, tooltip) {
    const termRect = term.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 10;
    const gap = 10;

    let left = termRect.left + termRect.width / 2 - tooltipRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

    let top = termRect.top - tooltipRect.height - gap;

    if (top < margin) {
      top = termRect.bottom + gap;
    }

    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function showTooltip(term) {
    const tip = term.dataset.tip;

    if (!tip) {
      return;
    }

    const tooltip = getTooltipElement();
    activeTerm = term;
    tooltip.textContent = tip;
    tooltip.dataset.visible = "true";
    tooltip.setAttribute("aria-hidden", "false");
    positionTooltip(term, tooltip);
  }

  function hideTooltip(term) {
    if (term && activeTerm && term !== activeTerm) {
      return;
    }

    const tooltip = getTooltipElement();
    activeTerm = null;
    tooltip.dataset.visible = "false";
    tooltip.setAttribute("aria-hidden", "true");
  }

  function setupFloatingTooltips() {
    if (floatingTooltipsReady) {
      return;
    }

    floatingTooltipsReady = true;
    getTooltipElement();

    document.addEventListener("mouseover", (event) => {
      const term = event.target.closest(".term-tip[data-tip]");

      if (term) {
        showTooltip(term);
      }
    });

    document.addEventListener("mouseout", (event) => {
      const term = event.target.closest(".term-tip[data-tip]");

      if (term && !term.contains(event.relatedTarget)) {
        hideTooltip(term);
      }
    });

    document.addEventListener("focusin", (event) => {
      const term = event.target.closest(".term-tip[data-tip]");

      if (term) {
        showTooltip(term);
      }
    });

    document.addEventListener("focusout", (event) => {
      const term = event.target.closest(".term-tip[data-tip]");

      if (term) {
        hideTooltip(term);
      }
    });

    window.addEventListener("scroll", () => {
      if (activeTerm) {
        positionTooltip(activeTerm, getTooltipElement());
      }
    }, true);

    window.addEventListener("resize", () => {
      if (activeTerm) {
        positionTooltip(activeTerm, getTooltipElement());
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideTooltip();
      }
    });
  }

  function decorateTextNode(node, tipCounts) {
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const prefix = match[1] || "";
      const term = match[2];
      const termStart = match.index + prefix.length;
      const termEnd = termStart + term.length;
      const tip = termTips.get(term);

      if (!tip) {
        continue;
      }

      const currentCount = tipCounts.get(tip) || 0;

      if (currentCount >= MAX_AUTO_DECORATIONS_PER_TIP) {
        continue;
      }

      if (termStart > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, termStart)));
      }

      fragment.appendChild(makeTermElement(term, tip));
      tipCounts.set(tip, currentCount + 1);
      lastIndex = termEnd;

      if (pattern.lastIndex === match.index) {
        pattern.lastIndex += 1;
      }
    }

    if (lastIndex === 0) {
      return;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.parentNode.replaceChild(fragment, node);
  }

  function applyTermTooltips() {
    setupFloatingTooltips();

    const roots = document.querySelectorAll(".md-content .md-typeset");

    for (const root of roots) {
      const textNodes = [];
      const tipCounts = new Map();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim() || shouldSkipTextNode(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          pattern.lastIndex = 0;
          return pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });

      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      for (const node of textNodes) {
        if (!shouldSkipTextNode(node)) {
          decorateTextNode(node, tipCounts);
        }
      }
    }
  }

  if (window.document$) {
    window.document$.subscribe(applyTermTooltips);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTermTooltips);
  } else {
    applyTermTooltips();
  }
})();
