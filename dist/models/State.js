"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const typeorm_1 = require("typeorm");
const Inventory_1 = require("./Inventory");
const ShopItem_1 = require("./ShopItem");
let State = class State extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], State.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 500 }),
    __metadata("design:type", Number)
], State.prototype, "energy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 500 }),
    __metadata("design:type", Number)
], State.prototype, "max_energy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], State.prototype, "energy_restore", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], State.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], State.prototype, "coins", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], State.prototype, "passive_income", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], State.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], State.prototype, "tap_power", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Inventory_1.Inventory, state => state.state),
    __metadata("design:type", Inventory_1.Inventory)
], State.prototype, "inventory", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ShopItem_1.ShopItem, shopItem => shopItem.states),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], State.prototype, "shopItems", void 0);
State = __decorate([
    (0, typeorm_1.Entity)()
], State);
exports.State = State;
//# sourceMappingURL=State.js.map