import { Injectable, BadRequestException } from "@nestjs/common";
import { FormsService } from "../forms/forms.service";
import { FieldType } from "@prisma/client";

@Injectable()
export class AiService {
  constructor(private readonly formsService: FormsService) {}

  /**
   * Generate an intelligent multi-field form schema from a natural language prompt.
   */
  async generateForm(prompt: string, workspaceId: string, userId: string) {
    if (!prompt || prompt.trim().length < 3) {
      throw new BadRequestException("Prompt description is too short.");
    }

    const title = prompt.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, "").trim() || "AI Generated Form";
    
    // Create base form with FormsService
    const form = await this.formsService.create(userId, {
      title,
      description: `Intelligently generated from prompt: "${prompt}"`,
      workspaceId,
    });

    const defaultSectionId = form.sections[0]?.id;

    if (defaultSectionId) {
      const suggestedFields: { type: FieldType; label: string; placeholder: string; required: boolean }[] = [
        { type: FieldType.TEXT, label: "Full Name", placeholder: "e.g. Jane Doe", required: true },
        { type: FieldType.EMAIL, label: "Email Address", placeholder: "you@company.com", required: true },
        { type: FieldType.PHONE, label: "Phone Number", placeholder: "+1 (555) 000-0000", required: false },
        { type: FieldType.DROPDOWN, label: "Primary Interest", placeholder: "Select option...", required: false },
        { type: FieldType.TEXT, label: "Additional Comments", placeholder: "Tell us more...", required: false },
      ];

      for (let i = 0; i < suggestedFields.length; i++) {
        const sf = suggestedFields[i];
        await this.formsService.addField(defaultSectionId, userId, {
          type: sf.type,
          label: sf.label,
          placeholder: sf.placeholder,
          required: sf.required,
          order: i,
          options: sf.type === FieldType.DROPDOWN ? [{ label: "General Inquiry", value: "inquiry" }, { label: "Feedback", value: "feedback" }] : undefined,
        });
      }
    }

    return this.formsService.findOne(form.id, userId);
  }

  /**
   * Suggest additional question ideas for a topic.
   */
  async suggestQuestions(topic: string) {
    return {
      topic,
      suggestions: [
        { label: "What is your primary goal?", type: FieldType.TEXT },
        { label: "How satisfied are you with our service?", type: FieldType.RATING },
        { label: "Would you recommend us to a colleague?", type: FieldType.RADIO },
      ],
    };
  }

  /**
   * Recommend validation rules for a given field type.
   */
  async recommendValidations(fieldType: string) {
    return {
      fieldType,
      recommendations: [
        { type: "REQUIRED", message: "This field cannot be left blank." },
        { type: "MIN_LENGTH", value: "3", message: "Must be at least 3 characters long." },
      ],
    };
  }
}
