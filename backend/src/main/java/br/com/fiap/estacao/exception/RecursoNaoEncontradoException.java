package br.com.fiap.estacao.exception;

/**
 * Lançada quando um recurso (leitura, atuador ou falha) não existe. Vira HTTP 404.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
