import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedTimezone, TimezoneGroup } from './timezone-utils';

@Pipe({
  name: 'filterTimezones',
})
export class FilterTimezonesPipe implements PipeTransform {

  transform(
    value: TimezoneGroup[] | null | undefined,
    searchTerm: string | null | undefined
  ): TimezoneGroup[] | null | undefined {

    if (!value) {
      return value;
    }
    if (!searchTerm || searchTerm.trim() === '') {
      return value;
    }

    const lowerSearchTerm = searchTerm.trim().toLowerCase();
    const timezoneMatches = (timezone: LocalizedTimezone, term: string): boolean => {
      return (
        timezone.id.toLowerCase().includes(term) ||
        !!(timezone.shortName && timezone.shortName.toLowerCase().includes(term)));
    };

    const resultGroups: TimezoneGroup[] = [];
    for (const group of value) { // Iterate directly over TimezoneGroup[]
      const groupNameMatches = group.name.toLowerCase().includes(lowerSearchTerm);
      const filteredTimezonesInGroup = group.timezones.filter(tz => timezoneMatches(tz, lowerSearchTerm));

      // A group is included if its name matches OR it has matching timezones after filtering
      if (groupNameMatches || filteredTimezonesInGroup.length > 0) {
        resultGroups.push({
          ...group,
          timezones: filteredTimezonesInGroup // Always use the filtered list of timezones for the group
        });
      }
    }
    return resultGroups;
  }
}
