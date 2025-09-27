import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-basecoat-select',
  templateUrl: './basecoat-select.component.html',
  styleUrls: ['./basecoat-select.component.css'],
  imports: [CommonModule, FormsModule],
})
export class BasecoatSelectComponent implements OnInit {
  @Input() options: { value: string; label: string }[] = [];
  @Input() selectedValue = '';
  @Output() selectedValueChange = new EventEmitter<string>();

  isDropdownOpen = false;
  searchTerm = '';
  filteredOptions: { value: string; label: string }[] = [];

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  filterOptions() {
    this.filteredOptions = this.options.filter((option) =>
      option.label.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  selectOption(value: string) {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
    this.isDropdownOpen = false;
  }

  getSelectedLabel(): string {
    const selectedOption = this.options.find(
      (option) => option.value === this.selectedValue,
    );
    return selectedOption ? selectedOption.label : 'Select Status';
  }
}
