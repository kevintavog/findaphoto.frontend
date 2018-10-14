import {Module, VuexModule, Mutation} from 'vuex-module-decorators'

export interface ErrorMessageAndId {
    id: string
    message: string
}

@Module
export default class ErrorMessageModule extends VuexModule {
    public messages: ErrorMessageAndId[] = []
    private id = 0

    @Mutation
    public addErrorMessage(message: string): void {
        this.id += 1
        this.messages.push({id: this.id.toString(), message})
    }

    @Mutation
    public clearErrorMessages(): void {
        this.messages.splice(0, this.messages.length)
    }

    @Mutation
    public closeErrorMessage(err: ErrorMessageAndId): void {
        this.messages.forEach( (item, index) => {
            if (item === err) {
                this.messages.splice(index, 1)
            }
        })
    }
}
