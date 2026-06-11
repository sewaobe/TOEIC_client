import { LearningPathStrategyOverviewResponse, SelectLearningPathStrategyOptionResponse } from "../types/learning_strategy";
import { GetLearningPathSkillMapParams } from "../types/user_skill";
import axiosClient from "./axiosClient";

export type LearningPathV2SetupPayload = {
  target_score: number;
  target_completion_date: string | Date;
  time_per_day: number;
  days_per_week: number;
};

const BASE_URL = "/learning-path-v2";

/**
 * Tạm thời bật mock để FE làm trước.
 *
 * Sau này khi BE có API:
 * GET /learning-path-v2/:learningPathId/nodes/:lessonManagerId/detail
 *
 * thì đổi flag này về false, hoặc dùng env:
 * const USE_MOCK_NODE_DETAIL = import.meta.env.VITE_MOCK_LEARNING_PATH_NODE_DETAIL === "true";
 */
const USE_MOCK_NODE_DETAIL = true;

export type RoadmapUnitStatus = "completed" | "in_cycle" | "current" | "locked";

export type RoadmapNodeDetailUnit = {
  lesson_manager_id: string;
  title: string;
  part_type: number;
  unit_type: string;
  node_role?: string;
  target_tags?: string[];
  order: number;
  planned_minutes?: number;
  estimated_gain?: number;
  score_band?: {
    from?: number;
    to?: number;
  };
  prerequisite_unit_ids?: string[];
  next_unit_ids?: string[];
};

export type NodeReasonType =
  | "roadmap_projection"
  | "snapshot_weak_part"
  | "snapshot_weak_skill"
  | "target_alignment"
  | "prerequisite_support";

export type NodeReasonEvidenceTone = "good" | "warning" | "neutral";

export type NodeReasonEvidence = {
  label: string;
  value: string;
  tone?: NodeReasonEvidenceTone;
};

export type NodeReason = {
  type: NodeReasonType;
  title: string;
  text: string;
  priority: number;
  evidence: NodeReasonEvidence[];
};

export type NodeDetailActivityStatus =
  | "completed"
  | "in_progress"
  | "upcoming"
  | "planned";

export type NodeDetailActivity = {
  order: number;
  title: string;
  type_label: string;
  status: NodeDetailActivityStatus;
  estimated_minutes: number;
};

export type LearningPathNodeDetailResponse = {
  lesson_manager_id: string;
  title: string;
  part_type: number;
  skill_group: "Listening" | "Reading";
  status: RoadmapUnitStatus;

  unit_type: string;
  unit_type_label: string;
  node_role?: string;

  target_tags: string[];
  short_tags: string[];

  planned_minutes: number;
  estimated_gain?: number;
  score_band?: {
    from?: number;
    to?: number;
  };

  roadmap_context_label: string;
  status_label: string;

  explanation: {
    source: "mock_fe" | "backend";
    reasons: NodeReason[];
    adaptive_note: string;
  };

  activities: NodeDetailActivity[];

  primary_action: {
    label: string;
    enabled: boolean;
  };

  /**
   * Metadata này giúp Codex/BE sau này hiểu response mock đang giả lập từ nguồn nào.
   * BE thật nên build reason từ:
   * - SchedulerDecisionLog.input_snapshot
   * - WeekStudy / DayStudy current cycle
   * - StrategyOption.part_roadmaps
   * - LessonManager node
   */
  debug_contract_note: string;
};

export type LearningPathNodeDetailMockContext = {
  /**
   * FE truyền unit/status từ Canvas vào để mock service dựng response.
   * BE thật sau này không cần field này, vì BE tự query LearningPath/StrategyOption/WeekStudy/DayStudy.
   */
  unit: RoadmapNodeDetailUnit;
  status: RoadmapUnitStatus;

  /**
   * Optional: truyền overview nếu muốn mock chính xác hơn.
   * Ví dụ lấy target_score, selected_strategy_option, roadmap_canvas.
   */
  overview?: any;
};

const toPercent = (ability: number) => `${Math.round(ability * 100)}%`;

const stripPartPrefix = (tag: string) =>
  tag.replace(/^\[Part\s*\d+\]\s*/i, "").trim();

const getShortTag = (tag: string) =>
  stripPartPrefix(tag)
    .replace("Câu hỏi về ", "")
    .replace("Câu hỏi ", "")
    .replace("Dạng bài: ", "")
    .replace("Hình thức: ", "")
    .replace(/\s*\(.+\)\s*/g, "")
    .trim();

const getPartSkillGroup = (partType: number): "Listening" | "Reading" => {
  if ([1, 2, 3, 4].includes(partType)) return "Listening";
  return "Reading";
};

const getUnitTypeLabel = (unitType: string) => {
  if (unitType === "foundation") return "Nền tảng";
  if (unitType === "skill_drill") return "Luyện kỹ năng";
  if (unitType === "mixed_practice") return "Luyện tổng hợp";
  if (unitType === "exam_practice") return "Luyện đề";
  if (unitType === "remedial") return "Chữa hổng";
  return "Bài học";
};

const getStatusLabel = (status: RoadmapUnitStatus) => {
  if (status === "completed") return "Đã hoàn thành";
  if (status === "current") return "Đang học";
  if (status === "in_cycle") return "Trong cycle này";

  /**
   * Internal vẫn là locked, nhưng UI/business meaning là "Dự kiến".
   * Không hiển thị chữ "Khóa" ở roadmap detail vì dễ làm user hiểu là bị chặn.
   */
  return "Dự kiến";
};

const getRoadmapContextLabel = (status: RoadmapUnitStatus) => {
  if (status === "current") return "Stage hiện tại";
  if (status === "in_cycle") return "Đã chọn cho cycle này";
  if (status === "completed") return "Đã tính vào tiến độ";
  return "Roadmap dự kiến";
};

const getAdaptiveNoteText = (status: RoadmapUnitStatus) => {
  if (status === "current") {
    return "Bạn nên hoàn thành bài này trước. Các bài tiếp theo trong cycle sẽ mở theo thứ tự để giữ nhịp học ổn định.";
  }

  if (status === "in_cycle") {
    return "Bài này đã nằm trong kế hoạch ngắn hạn. Hệ thống sẽ mở khi bạn đi tới Stage tương ứng.";
  }

  if (status === "completed") {
    return "Bài đã hoàn thành vẫn có thể được xem lại để ôn tập, nhưng hệ thống sẽ ưu tiên các bài chưa học trong cycle tiếp theo.";
  }

  return "Đây là bản xem trước của lộ trình. Thứ tự hoặc nội dung có thể thay đổi nếu kết quả kiểm tra sau này cho thấy bạn cần hướng học khác.";
};

const getPrimaryAction = (status: RoadmapUnitStatus) => {
  if (status === "current") return { label: "Tiếp tục học", enabled: true };
  if (status === "in_cycle") return { label: "Xem trong Cycle", enabled: true };
  if (status === "completed") return { label: "Xem lại bài", enabled: true };
  return { label: "Đã hiểu", enabled: true };
};

const buildMockActivities = (
  status: RoadmapUnitStatus,
  unit: RoadmapNodeDetailUnit
): NodeDetailActivity[] => {
  const baseMinutes = unit.planned_minutes ?? 24;
  const shortTag = getShortTag(unit.target_tags?.[0] ?? "kỹ năng trọng tâm");

  const getStatus = (order: number): NodeDetailActivityStatus => {
    if (status === "completed") return "completed";
    if (status === "current") return order === 1 ? "in_progress" : "upcoming";
    if (status === "in_cycle") return "upcoming";
    return "planned";
  };

  return [
    {
      order: 1,
      title: `Nắm trọng tâm ${shortTag}`,
      type_label: "Bài học lý thuyết",
      status: getStatus(1),
      estimated_minutes: Math.max(6, Math.round(baseMinutes * 0.35)),
    },
    {
      order: 2,
      title: `Flashcard cụm từ ${shortTag}`,
      type_label: "Flashcard từ vựng",
      status: getStatus(2),
      estimated_minutes: Math.max(5, Math.round(baseMinutes * 0.25)),
    },
    {
      order: 3,
      title: `Quiz ứng dụng ${shortTag}`,
      type_label: "Quiz luyện tập",
      status: getStatus(3),
      estimated_minutes: Math.max(7, Math.round(baseMinutes * 0.4)),
    },
  ];
};

/**
 * Mock snapshot giả lập SchedulerDecisionLog.input_snapshot.
 *
 * BE thật không được lấy UserSkill live để giải thích node/cycle cũ.
 * BE thật nên lấy snapshot tại thời điểm tạo cycle từ SchedulerDecisionLog.input_snapshot:
 * - part_abilities
 * - skill_abilities
 * - target_score
 * - test_type
 * - weekly_available_minutes
 *
 * FE mock ở đây chỉ tạo số minh họa để demo.
 */
const buildMockDecisionSnapshot = (unit: RoadmapNodeDetailUnit) => {
  const partAbilityByPart: Record<number, number> = {
    1: 0.38,
    2: 0.46,
    3: 0.40,
    4: 0.45,
    5: 0.43,
    6: 0.32,
    7: 0.48,
  };

  const partAbility = partAbilityByPart[unit.part_type] ?? 0.42;
  const firstTag = getShortTag(unit.target_tags?.[0] ?? "kỹ năng trọng tâm");

  /**
   * Mock skill ability thấp hơn part ability một chút để demo reason skill yếu.
   * BE thật phải match target_tags -> skill_key -> input_snapshot.skill_abilities.
   */
  const skillAbility = Math.max(0.12, partAbility - 0.12);

  const getStatus = (ability: number) => {
    if (ability < 0.4) return "weak";
    if (ability < 0.47) return "medium";
    return "strong";
  };

  return {
    target_score: 505,
    part: {
      part_type: unit.part_type,
      ability: partAbility,
      ability_percent: toPercent(partAbility),
      status: getStatus(partAbility),
    },
    matched_skill: {
      label: firstTag,
      ability: skillAbility,
      ability_percent: toPercent(skillAbility),
      status: getStatus(skillAbility),
    },
  };
};

const isWeakStatus = (status: string) => status === "weak";

const isRoadmapProjectionStatus = (status: RoadmapUnitStatus) => status === "locked";

const isTargetAligned = (unit: RoadmapNodeDetailUnit, targetScore: number) => {
  const from = unit.score_band?.from;
  const to = unit.score_band?.to;

  if (typeof from !== "number" || typeof to !== "number") return false;

  if (from <= targetScore && targetScore <= to) return true;

  const distance =
    targetScore < from ? from - targetScore : targetScore > to ? targetScore - to : 0;

  return distance <= 50;
};

const hasPrerequisiteSupportSignal = (unit: RoadmapNodeDetailUnit) => {
  /**
   * MVP mock:
   * - foundation/remedial thường là bài nền/chữa hổng.
   * - hoặc node có next_unit_ids nghĩa là có thể mở tiếp route sau.
   *
   * BE thật nên xác định chính xác:
   * selectedUnits.some(other => other.prerequisite_unit_ids.includes(unit.lesson_manager_id))
   */
  return (
    unit.unit_type === "foundation" ||
    unit.unit_type === "remedial" ||
    Boolean(unit.next_unit_ids?.length)
  );
};

const buildMockNodeReasons = (
  unit: RoadmapNodeDetailUnit,
  status: RoadmapUnitStatus
): NodeReason[] => {
  const snapshot = buildMockDecisionSnapshot(unit);
  const reasons: NodeReason[] = [];

  /**
   * 2. roadmap_projection
   * Chỉ hợp lý với locked.
   * Internal status là locked nhưng UI/meaning là "Dự kiến".
   */
  if (isRoadmapProjectionStatus(status)) {
    reasons.push({
      type: "roadmap_projection",
      title: "Bài này nằm trong roadmap dự kiến",
      text:
        "Bài này đang nằm trong lộ trình dự kiến theo chiến lược hiện tại. Sau Mini Test / Full Test, hệ thống có thể giữ, đổi thứ tự hoặc thay bằng bài phù hợp hơn.",
      priority: 10,
      evidence: [
        { label: "Trạng thái", value: "Dự kiến" },
        { label: "Nguồn", value: "Roadmap theo chiến lược hiện tại" },
      ],
    });
  }

  /**
   * 3. snapshot_weak_part
   * Chỉ show nếu snapshot tại thời điểm tạo cycle cho thấy Part yếu.
   *
   * Lưu ý wording "Khi tạo cycle này" để tránh nhầm với UserSkill live hiện tại.
   */
  if (isWeakStatus(snapshot.part.status)) {
    reasons.push({
      type: "snapshot_weak_part",
      title: `Part ${unit.part_type} đang cần ưu tiên`,
      text: `Khi tạo cycle này, Part ${unit.part_type} được ghi nhận ở mức ${snapshot.part.ability_percent} và thuộc nhóm yếu. Vì vậy hệ thống ưu tiên các bài thuộc Part này trong kế hoạch học.`,
      priority: 20,
      evidence: [
        {
          label: "Năng lực khi tạo cycle",
          value: snapshot.part.ability_percent,
          tone: "warning",
        },
        { label: "Nhóm", value: "Yếu", tone: "warning" },
      ],
    });
  }

  /**
   * 4. snapshot_weak_skill
   * Chỉ show nếu skill match với unit.target_tags đang yếu trong snapshot.
   */
  if (isWeakStatus(snapshot.matched_skill.status)) {
    reasons.push({
      type: "snapshot_weak_skill",
      title: `Kỹ năng ${snapshot.matched_skill.label} còn yếu`,
      text: `Khi tạo cycle này, kỹ năng “${snapshot.matched_skill.label}” được ghi nhận ở mức ${snapshot.matched_skill.ability_percent}. Bài này giúp bạn củng cố đúng kỹ năng đang kéo kết quả xuống.`,
      priority: 30,
      evidence: [
        { label: "Kỹ năng", value: snapshot.matched_skill.label },
        {
          label: "Năng lực khi tạo cycle",
          value: snapshot.matched_skill.ability_percent,
          tone: "warning",
        },
      ],
    });
  }

  /**
   * 5. prerequisite_support
   * Chỉ show khi node có tín hiệu là bài nền/chữa hổng/support route.
   */
  if (hasPrerequisiteSupportSignal(unit)) {
    reasons.push({
      type: "prerequisite_support",
      title: "Bài nền hỗ trợ roadmap",
      text:
        "Bài này giúp củng cố kiến thức nền hoặc mở đường cho các bài tiếp theo trong roadmap, nên hệ thống có thể đưa vào trước những bài khó hơn.",
      priority: 40,
      evidence: [
        { label: "Loại bài", value: getUnitTypeLabel(unit.unit_type) },
        {
          label: "Vai trò",
          value: unit.node_role === "support" ? "Bài bổ trợ" : "Bài trong route chính",
        },
      ],
    });
  }

  /**
   * 6. target_alignment
   * Chỉ show nếu score_band gần hoặc bao phủ target_score.
   */
  if (isTargetAligned(unit, snapshot.target_score)) {
    const from = unit.score_band?.from;
    const to = unit.score_band?.to;

    reasons.push({
      type: "target_alignment",
      title: `Phù hợp mục tiêu ${snapshot.target_score} TOEIC`,
      text:
        typeof from === "number" && typeof to === "number"
          ? `Bài này thuộc band ${from}–${to}, gần với mục tiêu ${snapshot.target_score} TOEIC của bạn.`
          : `Bài này nằm gần vùng mục tiêu ${snapshot.target_score} TOEIC của bạn.`,
      priority: 50,
      evidence: [
        { label: "Mục tiêu", value: `${snapshot.target_score} TOEIC` },
        {
          label: "Band bài học",
          value:
            typeof from === "number" && typeof to === "number"
              ? `${from}–${to}`
              : "Chưa có band",
        },
      ],
    });
  }

  return reasons.sort((a, b) => a.priority - b.priority);
};

const buildMockNodeDetailResponse = (
  learningPathId: string,
  lessonManagerId: string,
  context: LearningPathNodeDetailMockContext
): LearningPathNodeDetailResponse => {
  const unit = context.unit;
  const status = context.status;
  const shortTags = (unit.target_tags ?? []).map(getShortTag).filter(Boolean);

  return {
    lesson_manager_id: lessonManagerId,
    title: unit.title || `Bài học Part ${unit.part_type}`,
    part_type: unit.part_type,
    skill_group: getPartSkillGroup(unit.part_type),
    status,

    unit_type: unit.unit_type,
    unit_type_label: getUnitTypeLabel(unit.unit_type),
    node_role: unit.node_role,

    target_tags: unit.target_tags ?? [],
    short_tags: shortTags,

    planned_minutes: unit.planned_minutes ?? 24,
    estimated_gain:
      typeof unit.estimated_gain === "number"
        ? Math.round(unit.estimated_gain * 100) / 100
        : undefined,
    score_band: unit.score_band,

    roadmap_context_label: getRoadmapContextLabel(status),
    status_label: getStatusLabel(status),

    explanation: {
      source: "mock_fe",
      reasons: buildMockNodeReasons(unit, status),
      adaptive_note: getAdaptiveNoteText(status),
    },

    activities: buildMockActivities(status, unit),
    primary_action: getPrimaryAction(status),

    debug_contract_note:
      `Mock FE response for ${learningPathId}. ` +
      "BE should implement GET /learning-path-v2/:learningPathId/nodes/:lessonManagerId/detail using SchedulerDecisionLog.input_snapshot, WeekStudy/DayStudy, StrategyOption.part_roadmaps, and LessonManager.",
  };
};

const learningPathV2Service = {
  setup: async (payload: LearningPathV2SetupPayload) => {
    return axiosClient.put(`${BASE_URL}/setup`, payload);
  },

  getGenerationContext: async () => {
    return axiosClient.get(`${BASE_URL}/generation-context`);
  },

  initialGeneration: async (learningPathId: string) => {
    return axiosClient.post(`${BASE_URL}/${learningPathId}/initial-generation`, {});
  },

  getCurrentCycle: async (learningPathId: string) => {
    return axiosClient.get(`${BASE_URL}/${learningPathId}/current-cycle`);
  },

  getOverview: async (learningPathId: string) => {
    return axiosClient.get(`${BASE_URL}/${learningPathId}/overview`);
  },

  /**
   * Node Detail API contract for FE Modal.
   *
   * Current FE mock:
   * - FE still calls service method like a real API.
   * - This method returns Promise<{ data: LearningPathNodeDetailResponse }>
   *   to mimic axios response shape.
   *
   * Future BE endpoint:
   * GET /learning-path-v2/:learningPathId/nodes/:lessonManagerId/detail
   *
   * Future BE should return:
   * - LessonManager node metadata
   * - runtime status: completed | current | in_cycle | locked
   * - activities from LessonManager recommended_activity_order / DayStudy runtime
   * - explanation.reasons from SchedulerDecisionLog.input_snapshot and cycle context
   *
   * Important:
   * - Do NOT use live UserSkill to explain why an old cycle selected this node.
   * - Use SchedulerDecisionLog.input_snapshot for "Khi tạo cycle này..." evidence.
   */
  getNodeDetail: async (
    learningPathId: string,
    lessonManagerId: string,
    mockContext?: LearningPathNodeDetailMockContext
  ): Promise<{ data: LearningPathNodeDetailResponse }> => {
    if (USE_MOCK_NODE_DETAIL) {
      if (!mockContext?.unit || !mockContext?.status) {
        throw new Error(
          "Mock getNodeDetail cần mockContext.unit và mockContext.status từ Canvas."
        );
      }

      return Promise.resolve({
        data: buildMockNodeDetailResponse(
          learningPathId,
          lessonManagerId,
          mockContext
        ),
      });
    }

    return axiosClient.get(
      `${BASE_URL}/${learningPathId}/nodes/${lessonManagerId}/detail`
    );
  },

  getSkillMap: async (
    learningPathId: string,
    params: GetLearningPathSkillMapParams = {}
  ) => {
    return axiosClient.get(`${BASE_URL}/${learningPathId}/skill-map`, {
      params,
    });
  },

  getStrategy: async (learningPathId: string) => {
    return axiosClient.get<LearningPathStrategyOverviewResponse>(
      `${BASE_URL}/${learningPathId}/strategy`
    );
  },

  selectStrategyOption: async (learningPathId: string, optionId: string) => {
    return axiosClient.post<SelectLearningPathStrategyOptionResponse>(
      `${BASE_URL}/${learningPathId}/strategy-options/${optionId}/select`,
      {}
    );
  },
};

export default learningPathV2Service;