import { PluginRegistry } from "../../core/registry.js";
import { createOnboardingPlugin, OnboardingPlugin } from "../onboarding/onboarding-plugin.js";

export { createOnboardingPlugin, OnboardingPlugin } from "../onboarding/onboarding-plugin.js";
export {
  onboardingCheckpoints,
  onboardingDictionaries,
  onboardingDomainId,
  onboardingEventMaps,
  onboardingInformationItems,
  onboardingSubject,
  onboardingTimelineItems
} from "../onboarding/onboarding-data.js";

export function createCompanyRegistry() {
  return new PluginRegistry().register(createOnboardingPlugin());
}

export const companyPluginClasses = {
  OnboardingPlugin
};
